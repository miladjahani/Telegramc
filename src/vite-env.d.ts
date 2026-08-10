/// <reference types="vite/client" />
declare module 'telegram' {
  export namespace Api {
    namespace auth { class SignIn { constructor(o: any); } class CheckPassword { constructor(o: any); } class LogOut { constructor(); } }
    namespace account { class GetPassword { constructor(); } }
    interface Message { id: number; date: number; media?: any; document?: any; photo?: any; video?: any; audio?: any; voice?: any; }
  }
  export class TelegramClient { constructor(s: any, id: number, h: string, o?: any); connect(): Promise<void>; disconnect(): Promise<void>; getMe(): Promise<any>; getMessages(e: any, o?: any): Promise<any[]>; getDialogs(o?: any): Promise<any>; forwardMessages(e: any, o?: any): Promise<any>; sendFile(e: any, o?: any): Promise<any>; sendCode(o: any, p: string): Promise<any>; invoke(r: any): Promise<any>; downloadMedia(m: any, o?: any): Promise<any>; downloadFile(l: any, o?: any): Promise<any>; deleteMessages(e: any, i: number[], o?: any): Promise<any>; computeCheck(p: any, s: any): Promise<any>; session: any; connected: boolean; }
  export class StringSession { constructor(s?: string); save(): string; }
}
declare module 'telegram/sessions' { export class StringSession { constructor(s?: string); save(): string; } }