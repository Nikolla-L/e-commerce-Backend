const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'eCommerseTeam@gmail.com',
        pass: 'kuzanovi0000'
    }, 
    tls:{
        rejectUnauthorized:false
    }
});

export const sendWelcome = async (email: string) => {
    await transporter.sendMail({
        from: '"Welcome" <eCommerseTeam@gmail.com>',
        to: email,
        subject: "welcome", 
        html: `<p>გმადლობთ გამოწერისთის, ამიერიდან თვქენ ყოველ ახალ დამატებულ პროდუქტზე მიიღებთ შეტყობინებას. არ გამაზოთ სიახლეები!</p>`,
    });
}

export const sendNews = async (emails: Array<string>) => {
    await transporter.sendMail({
        from: '"e_commerse" <eCommerseTeam@gmail.com>',
        to: emails,
        subject: "Check out new product", 
        html: `<p>დაათვალიერეთ ახალი პროდუქტი ჩვენს ვებ-გვერდზე</p>`,
    });
}

export const sendCode = async (email: string, code: string) => {
    await transporter.sendMail({
        from: '"e_commerse" <eCommerseTeam@gmail.com>',
        to: email,
        subject: "password reset code", 
        html: `<p>ერთჯერადი კოდია: <span style='color:red'>${code}</span>;</p>`,
    });
}