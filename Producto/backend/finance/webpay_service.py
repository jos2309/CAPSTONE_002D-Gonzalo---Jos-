"""
finance/webpay_service.py — Abstracción del SDK Transbank Webpay Plus.
"""
import logging
from django.conf import settings
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.options import WebpayOptions
from transbank.common.integration_type import IntegrationType

logger = logging.getLogger(__name__)


def _get_webpay_transaction():
    """Instancia la conexión Webpay usando la configuración del settings."""
    environment = IntegrationType.LIVE
    if settings.WEBPAY_ENVIRONMENT == 'INTEGRACION':
        environment = IntegrationType.TEST

    options = WebpayOptions(
        commerce_code=settings.WEBPAY_COMMERCE_CODE,
        api_key=settings.WEBPAY_API_KEY,
        integration_type=environment,
    )
    return Transaction(options)


def create_transaction(buy_order: str, session_id: str, amount: int, return_url: str) -> dict:
    """
    Inicia una transacción Webpay Plus.
    Restricciones estrictas de Transbank:
      - buy_order  <= 26 caracteres alfanuméricos/guiones.
      - session_id <= 61 caracteres alfanuméricos/guiones.
      - amount     int estricto (sin decimales ni comas).
      - return_url URL pública o local válida.
    """
    # Garantizar límites y tipos de datos estrictos
    clean_buy_order = str(buy_order).strip()[:26]
    clean_session_id = str(session_id).strip()[:61]
    clean_amount = int(round(float(amount)))

    tx = _get_webpay_transaction()
    try:
        response = tx.create(
            buy_order=clean_buy_order,
            session_id=clean_session_id,
            amount=clean_amount,
            return_url=return_url,
        )
    except Exception as e:
        logger.error(f"[Transbank SDK Error] Excepción en create_transaction: {e}", exc_info=True)
        print(f"[Transbank SDK Error] Excepción en create_transaction: {type(e).__name__}: {str(e)}")
        raise

    token = getattr(response, 'token', None) or (response.get('token') if isinstance(response, dict) else None)
    url = getattr(response, 'url', None) or (response.get('url') if isinstance(response, dict) else None)

    return {
        'token': token,
        'url': url,
    }


def confirm_transaction(token: str) -> dict:
    """
    Confirma una transacción Webpay Plus usando su token.
    Devuelve el dict completo de respuesta de Transbank.
    """
    tx = _get_webpay_transaction()
    try:
        response = tx.commit(token=token)
    except Exception as e:
        logger.error(f"[Transbank SDK Error] Excepción en confirm_transaction: {e}", exc_info=True)
        print(f"[Transbank SDK Error] Excepción en confirm_transaction: {type(e).__name__}: {str(e)}")
        raise

    def _get_val(obj, key):
        if isinstance(obj, dict):
            return obj.get(key)
        return getattr(obj, key, None)

    return {
        'vci': _get_val(response, 'vci'),
        'amount': _get_val(response, 'amount'),
        'status': _get_val(response, 'status'),
        'buy_order': _get_val(response, 'buy_order'),
        'session_id': _get_val(response, 'session_id'),
        'card_detail': _get_val(response, 'card_detail'),
        'accounting_date': _get_val(response, 'accounting_date'),
        'transaction_date': str(_get_val(response, 'transaction_date')),
        'authorization_code': _get_val(response, 'authorization_code'),
        'payment_type_code': _get_val(response, 'payment_type_code'),
        'response_code': _get_val(response, 'response_code'),
        'installments_number': _get_val(response, 'installments_number'),
    }
