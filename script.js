const firebaseConfig = {
  apiKey: "AIzaSyA346adudnz0td36p4YZpBwdCgYbktDIrg",
  authDomain: "pcc-phet.firebaseapp.com",
  databaseURL: "https://pcc-phet-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pcc-phet",
  storageBucket: "pcc-phet.appspot.com",
  messagingSenderId: "633224365967",
  appId: "1:633224365967:web:134cedc5e99a306f056dfa"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let currentMoney = 0;

function updateBalanceDisplay() {
  document.getElementById("balance").innerText =
    "ยอดเงินคงเหลือ: " + currentMoney + " บาท";
}

function getMoneyFromDB() {
  db.ref("money").once("value", (snapshot) => {
    const data = snapshot.val();
    let total = 0;
    if (data) {
      Object.values(data).forEach((item) => {
        total += item.amount;
      });
    }
    currentMoney = total;
    updateBalanceDisplay();
  });
}

function saveMoney() {
  const amount = parseFloat(document.getElementById("moneyInput").value);
  if (!amount) return alert("กรุณากรอกจำนวนเงิน");
  db.ref("money").push({ amount: amount });
  currentMoney += amount;
  updateBalanceDisplay();
  document.getElementById("moneyInput").value = "";
  document.getElementById("message").innerText = "💰 เก็บเงินเรียบร้อย!";
}

function buyFood() {
  const price = 10;
  if (currentMoney < price) {
    document.getElementById("message").innerText = "❌ เงินไม่พอ!";
    return;
  }
  db.ref("money").push({ amount: -price });
  currentMoney -= price;
  db.ref("foods").push({ name: "อาหาร" });
  updateBalanceDisplay();
  document.getElementById("message").innerText = "🛒 ซื้ออาหารสำเร็จ!";
}

function loadFood() {
  db.ref("foods").once("value", (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById("foodContainer");
    container.innerHTML = "";
    if (data) {
      Object.keys(data).forEach((key) => {
        const item = document.createElement("div");
        item.className = "foodItem";
        const name = document.createElement("span");
        name.innerText = "🍎 อาหาร";
        const btn = document.createElement("button");
        btn.innerText = "ให้อาหาร";
        btn.onclick = () => {
          db.ref("foods/" + key)
            .remove()
            .then(() => {
              document.getElementById("message").innerText =
                "😋 สัตว์กินอาหารแล้ว!";
              loadFood();
            })
            .catch((err) => {
              document.getElementById("message").innerText =
                "เกิดข้อผิดพลาด: " + err.message;
            });
        };
        item.appendChild(name);
        item.appendChild(btn);
        container.appendChild(item);
      });
    } else {
      container.innerHTML = "ไม่มีอาหาร";
    }
  });
}

getMoneyFromDB();
