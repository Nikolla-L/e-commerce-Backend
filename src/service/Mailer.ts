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

export const sendRegistrationWelcome = async (email: string) => {
    await transporter.sendMail({
        from: '"Welcome" <eCommerseTeam@gmail.com>',
        to: email,
        subject: "welcome", 
        html: `<h1>გილოცავთ!</h1><br/><p>თქვენ წარმატებით დარეგისტრირდით ჩვენი გაყიდვების საიტზე, ამიერიდან შეგიძლიათ იყიდოთ პროდუქტები სასურველ ფასად. მეტი ინფორმაციისთის ეწვიეთ ჩვენს არსებულ ვებ გვერდს</p>`,
    });
}

export const sendWelcome = async (email: string) => {
    await transporter.sendMail({
        from: '"Welcome" <eCommerseTeam@gmail.com>',
        to: email,
        subject: "welcome", 
        html: `<h1 style="color: yellow">მოგესალმებით!</h1><br/><p>გმადლობთ გამოწერისთის, ამიერიდან თვქენ ყოველ ახალ დამატებულ პროდუქტზე მიიღებთ შეტყობინებას. არ გამაზოთ სიახლეები!</p>`,
    });
}

export const sendNews = async (emails: Array<string>) => {
    await transporter.sendMail({
        from: '"e_commerse" <eCommerseTeam@gmail.com>',
        to: ['eCommerseTeam@gmail.com', ...emails],
        subject: "Check out new product", 
        html: `<h1 style="color: blue">იჩქარეთ!</h1><br/><p>დაათვალიერეთ ახალი პროდუქტი ჩვენს ვებ-გვერდზე</p>`,
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

export const sendPassword = async (email: string, password: string) => {
    await transporter.sendMail({
        from: '"e_commerse" <eCommerseTeam@gmail.com>',
        to: email,
        subject: "Forget Password",
        html: `<p>თქვენი პაროლია: <span style='font-weight: bolder'>${password}}</span></p>`
    })
}