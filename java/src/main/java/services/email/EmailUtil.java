package services.email;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.io.UnsupportedEncodingException;
import java.util.Date;


public class EmailUtil {


    public static void sendEmail(Session session, String toEmail, String subject, String body) throws MessagingException, UnsupportedEncodingException {
        MimeMessage msg = new MimeMessage(session);
        //set message headers
        msg.addHeader("Content-type", "text/HTML; charset=UTF-8");
        msg.addHeader("format", "flowed");
        msg.addHeader("Content-Transfer-Encoding", "8bit");

        msg.setFrom(new InternetAddress("no_reply@example.com", "NoReply-JD"));

        msg.setReplyTo(InternetAddress.parse("no_reply@example.com", false));

        msg.setSubject(subject, "UTF-8");

        msg.setText(body, "UTF-8");

        msg.setSentDate(new Date());

        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail, false));
        System.out.println("message is ready");
        Transport.send(msg);

        System.out.println("email sent successfully!!");
    }
}