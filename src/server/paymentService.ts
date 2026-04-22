import crypto from 'crypto';

export class PaymentService {
  /**
   * Tạo URL thanh toán VNPAY
   */
  static createVNPayUrl(req: any, orderId: string, amount: number, orderInfo: string) {
    const tmnCode = process.env.VNPAY_TMN_CODE || 'DEMO_TMN';
    const secretKey = process.env.VNPAY_HASH_SECRET || 'DEMO_SECRET';
    let vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = `http://${req.headers.host}/api/orders/vnpay_return`;

    const date = new Date();
    const createDate = date.toISOString().replace(/T/, '').replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '');
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    // Sort params
    vnp_Params = this.sortObject(vnp_Params);

    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + new URLSearchParams(vnp_Params).toString();
    return vnpUrl;
  }

  /**
   * Webhook/IPN xử lý VNPAY trả kết quả
   */
  static verifyVNPayIPN(query: any) {
    let vnp_Params = query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);
    const secretKey = process.env.VNPAY_HASH_SECRET || 'DEMO_SECRET';

    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        return { success: true, orderId: vnp_Params['vnp_TxnRef'], message: 'Success' };
      }
      return { success: false, message: 'Transaction Failed' };
    } else {
      return { success: false, message: 'Invalid Signature' };
    }
  }

  /**
   * Tạo payload thanh toán MoMo
   */
  static async createMoMoRequest(orderId: string, amount: number, orderInfo: string) {
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO_DEMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'MOMO_ACCESS';
    const secretKey = process.env.MOMO_SECRET_KEY || 'MOMO_SECRET';
    const redirectUrl = `http://localhost:3000/orders/success`;
    const ipnUrl = `http://localhost:3000/api/orders/momo_ipn`;
    
    // Yêu cầu MoMo dùng requestId riêng lẻ, lấy bằng timestamp
    const requestId = partnerCode + new Date().getTime();
    const requestType = "captureWallet";
    const extraData = ""; 
    
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    
    const requestBody = {
      partnerCode: partnerCode,
      accessKey: accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: 'vi'
    };
    
    return requestBody; // Return body to send fetch to MoMo API
  }

  /**
   * Webhook/IPN xử lý MoMo trả kết quả
   */
  static verifyMoMoIPN(body: any) {
    const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = body;
    const secretKey = process.env.MOMO_SECRET_KEY || 'MOMO_SECRET';

    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY || 'MOMO_ACCESS'}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const signed = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    if (signature === signed) {
      if (resultCode === 0) {
        return { success: true, orderId: orderId, message: 'Success' };
      }
      return { success: false, message: message };
    } else {
      return { success: false, message: 'Invalid Signature' };
    }
  }

  private static sortObject(obj: any) {
    let sorted: any = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }
}
