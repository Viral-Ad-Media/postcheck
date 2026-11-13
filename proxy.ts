import { NextResponse } from 'next/server';
export function proxy(){
 const response=NextResponse.next();
 response.headers.set('Cache-Control','private, no-store, max-age=0');
 response.headers.set('Referrer-Policy','no-referrer');
 return response;
}
// Authorization lives at each server page, action and API boundary.
export const config={matcher:['/dashboard/:path*','/api/auth/:path*','/api/operations/:path*','/api/postcode','/auth/:path*','/login','/signup','/forgot-password','/reset-password','/resend-confirmation']};
