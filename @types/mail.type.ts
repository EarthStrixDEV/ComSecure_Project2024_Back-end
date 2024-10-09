export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
    attachments?: [{}];
    filename?: string | null;
    path?: string | null;
}