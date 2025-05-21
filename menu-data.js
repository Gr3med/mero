// menu-data.js
const hotelName = "فندق ماريوت";
const welcomeMessage = "مرحباً بكم في مطعم ماريوت. استمتع بتصفح قائمتنا الشهية!";

const menuCategories = {
    "المشروبات": [
        {
            id: "drink001",
            name: "عصير مانجو",
            description: "عصير مانجو طازج ومنعش.",
            price: 7, // السعر كرقم
            image: "images/mango-juice.jpg"
        },
        {
            id: "drink002",
            name: "ماء معدني",
            description: "مياه معدنية نقية.",
            price: 3,
            image: "images/water.jpg"
        },
        {
            id: "drink003",
            name: "بيبسي",
            description: "مشروب غازي منعش.",
            price: 5,
            image: "images/pepsi.jpg"
        }
    ],
    "القلابات": [
        {
            id: "qallab001",
            name: "فول",
            description: "طبق فول تقليدي غني بالنكهة.",
            price: 10,
            image: "images/foul.jpg"
        },
        {
            id: "qallab002",
            name: "عدس",
            description: "شوربة عدس دافئة ومغذية.",
            price: 10,
            image: "images/lentil.jpg"
        }
    ],
    "الأرز": [
        {
            id: "rice001",
            name: "أرز مندي",
            description: "أرز مندي شهي مع بهارات خاصة.",
            price: 20,
            image: "images/mendy.jpg"
        },
        {
            id: "rice002",
            name: "أرز كبسة",
            description: "الكبسة التقليدية الغنية بالنكهات.",
            price: 22,
            image: "images/kabsa.jpg"
        }
    ],
    "البروست": [
        {
            id: "broast001",
            name: "بروست دجاج",
            description: "قطع دجاج بروستد مقرمشة ولذيذة.",
            price: 25,
            image: "images/broast.jpg"
        }
    ],
    "الدجاج": [
        {
            id: "chicken001",
            name: "شواية دجاج",
            description: "دجاج كامل مشوي على الشواية بتتبيلة مميزة.",
            price: 30,
            image: "images/grilled-chicken.jpg"
        }
    ],
    "الوجبات السريعة": [
        {
            id: "fastfood001",
            name: "برجر لحم",
            description: "برجر لحم طازج مع الخضروات والصوص.",
            price: 15,
            image: "images/burger.jpg"
        },
        {
            id: "fastfood002",
            name: "شاورما دجاج",
            description: "ساندويتش شاورما دجاج بخبز طازج.",
            price: 12,
            image: "images/shawarma.jpg"
        },
        {
            id: "fastfood003",
            name: "بيتزا صغيرة",
            description: "بيتزا بحجم شخصي مع إضافاتك المفضلة.",
            price: 18,
            image: "images/pizza.jpg"
        }
    ]
};