package services.email;

import jakarta.mail.Authenticator;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import services.env.Env;

import java.io.UnsupportedEncodingException;
import java.util.Properties;

    public class Email {
        public static void send(String toEmail, String subject, String body) throws MessagingException, UnsupportedEncodingException {
            final String fromEmail = Env.dotenv.get("GMAIL_USER"); //requires valid gmail id
            final String password = Env.dotenv.get("GMAIL_PASSWORD"); // correct password for gmail id

            System.out.println("TLSEmail Start");
            Properties props = new Properties();
            props.put("mail.smtp.host", "smtp.gmail.com"); //SMTP Host
            props.put("mail.smtp.port", "587"); //TLS Port
            props.put("mail.smtp.auth", "true"); //enable authentication
            props.put("mail.smtp.starttls.enable", "true"); //enable STARTTLS

            //create Authenticator object to pass in Session.getInstance argument
            Authenticator auth = new Authenticator() {
                //override the getPasswordAuthentication method
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(fromEmail, password);
                }
            };
            Session session = Session.getInstance(props, auth);

            EmailUtil.sendEmail(session, toEmail, subject, body);

        }
    }
