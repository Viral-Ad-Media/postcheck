import nodemailer from 'nodemailer';
export function emailConfigured() { return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.AUTH_EMAIL_FROM); }
export async function sendAuthEmail(to:string, url:string, purpose:'verify'|'reset') {
 if(!emailConfigured()) throw new Error('Authentication email sender is not configured');
 const port=Number(process.env.SMTP_PORT || 587);
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port,secure:port===465,requireTLS:port!==465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},connectionTimeout:10000,socketTimeout:15000});
 const subject=purpose==='verify'?'Confirm your PostCheck email':'Reset your PostCheck password';
 await transport.sendMail({from:process.env.AUTH_EMAIL_FROM,to,subject,text:`${subject}\n\n${url}\n\nIf you did not request this, you can ignore this email.`});
}
