let items = [];
let selectedItems = [];

// دالة الإشعارات الأنيقة
function showNotification(message, type = 'success') {
  const backgroundColor = type === 'success' ? '#2ecc71' : 
                         type === 'error' ? '#e74c3c' : 
                         type === 'warning' ? '#f39c12' : '#3498db';
  
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: backgroundColor,
    stopOnFocus: true,
    style: {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '16px',
      borderRadius: '8px',
      padding: '12px 20px'
    }
  }).showToast();
}

// تحميل البيانات المحفوظة عند بدء التطبيق
window.onload = function() {
  loadItems();
  checkIfCustomerView();
};

// حفظ الأصناف في localStorage
function saveItems() {
  localStorage.setItem('restaurantItems', JSON.stringify(items));
}

// تحميل الأصناف من localStorage
function loadItems() {
  const saved = localStorage.getItem('restaurantItems');
  if (saved) {
    items = JSON.parse(saved);
  }
}

// التحقق من أن المستخدم يفتح رابط الطلب كزبون
function checkIfCustomerView() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderData = urlParams.get('order');
  
  if (orderData) {
    try {
      const orderItems = JSON.parse(decodeURIComponent(orderData));
      showCustomerInterface(orderItems);
    } catch (e) {
      console.error('خطأ في تحليل بيانات الطلب:', e);
    }
  }
}

// عرض واجهة إضافة صنف جديد
function showAddItemForm() {
  const content = document.getElementById("main-content");
  content.innerHTML = `
    <h2>CAVE RESTAURANT</h2>
    <h3>إضافة صنف جديد</h3>
         <input type="text" id="item-name" placeholder="اسم الصنف">
     <input type="number" id="item-price" placeholder="السعر باللبناني">
     <input type="text" id="item-features" placeholder="الخصائص (مفصولة بمسافة واحدة، مثال: طماطم كاتشاب بطاطا)">
    <button onclick="addItem()">💾 حفظ الصنف</button>
    <button onclick="showOrderInterface()" class="secondary-btn">← العودة للطلبات</button>
  `;
}

// إضافة صنف جديد
function addItem() {
  const name = document.getElementById("item-name").value;
  const price = parseInt(document.getElementById("item-price").value);
  const featuresText = document.getElementById("item-features").value;
  
  if (name && price > 0) {
    // تحويل النص إلى مصفوفة خصائص
    const features = featuresText.trim() ? featuresText.split(' ').filter(f => f.trim()) : [];
    
    const newItem = {
      id: Date.now(),
      name: name,
      price: price,
      features: features
    };
    
    items.push(newItem);
    saveItems();
    
    // مسح الحقول
    document.getElementById("item-name").value = "";
    document.getElementById("item-price").value = "";
    document.getElementById("item-features").value = "";
    
    showNotification("تمت إضافة الصنف بنجاح!", "success");
  } else {
    showNotification("يرجى إدخال اسم وسعر صحيح.", "error");
  }
}

// عرض واجهة إدارة الطلبات
function showOrderInterface() {
  const content = document.getElementById("main-content");
  content.innerHTML = `
    <h2>CAVE RESTAURANT</h2>
    <h3>إدارة الطلبات</h3>
    
    <div class="admin-controls">
      <input type="text" id="search-box" oninput="filterItems()" placeholder="ابحث عن صنف...">
      <button onclick="generateOrderLink()" class="generate-link-btn">🔗 توليد رابط الطلب</button>
    </div>
    
    <div id="items-list"></div>
    
    <div class="selected-items" id="selected-items">
      <h3>الطلب الحالي</h3>
      <div id="order-preview"></div>
      <div class="total-display" id="total-display">المجموع الكلي: 0 ل.ل</div>
      
      <div class="order-actions">
        <button onclick="printOrder()">🖨️ طباعة الطلبية</button>
        <button onclick="clearOrder()" class="clear-btn">🗑️ مسح الطلب</button>
      </div>
    </div>
  `;
  renderItems();
}

// توليد رابط الطلب للزبون
function generateOrderLink() {
  if (items.length === 0) {
    showNotification("لا توجد أصناف متاحة. يرجى إضافة أصناف أولاً.", "warning");
    return;
  }
  
  const orderData = encodeURIComponent(JSON.stringify(items));
  const orderUrl = `${window.location.origin}${window.location.pathname}?order=${orderData}`;
  
  // نسخ الرابط للحافظة
  navigator.clipboard.writeText(orderUrl).then(() => {
    showNotification("تم نسخ رابط الطلب! يمكنك الآن إرساله للزبون.", "success");
  }).catch(() => {
    // إذا فشل النسخ التلقائي، اعرض الرابط في مربع حوار
    const copiedUrl = prompt("رابط الطلب (انسخه يدوياً):", orderUrl);
    if (copiedUrl) {
      showNotification("تم نسخ الرابط بنجاح!", "success");
    }
  });
}

// عرض واجهة الزبون
function showCustomerInterface(orderItems) {
  // إخفاء الشريط الجانبي
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.style.display = 'none';
  
  const content = document.getElementById("main-content");
  content.innerHTML = `
    <div class="customer-header">
      <h1>🍽️ CAVE RESTAURANT 🍽️</h1>
      <p>مرحباً بك! اختر من قائمة طعامنا الشهية</p>
    </div>
    
    <div class="customer-interface">
      <div class="menu-section">
        <h3>📋 قائمة الطعام</h3>
        <input type="text" id="search-box" oninput="filterCustomerItems()" placeholder="ابحث عن صنف...">
        <div id="customer-items-list"></div>
      </div>
      
      <div class="order-section">
        <h3>🛒 طلبك</h3>
        <div id="customer-order-preview"></div>
        <div class="total-display" id="customer-total">المجموع الكلي: 0 ل.ل</div>
        
        <div class="customer-info">
          <h4>معلومات التوصيل</h4>
          <input type="text" id="customer-name" placeholder="اسمك" class="customer-input" required>
          <input type="text" id="customer-address" placeholder="عنوانك" class="customer-input" required>
          <input type="tel" id="customer-phone" placeholder="رقم الهاتف" class="customer-input">
        </div>
        
                 <div class="order-actions">
           <button onclick="sendCustomerOrder()" class="whatsapp-btn">📱 إرسال الطلبية</button>
           <button onclick="clearCustomerOrder()" class="clear-btn">🗑️ مسح الطلب</button>
         </div>
      </div>
    </div>
  `;
  
  // تعيين الأصناف للعرض
  items = orderItems;
  selectedItems = [];
  renderCustomerItems();
}

// عرض الأصناف للزبون
function renderCustomerItems(list = items) {
  const listContainer = document.getElementById("customer-items-list");
  if (!listContainer) return;
  
  listContainer.innerHTML = "";

  if (list.length === 0) {
    listContainer.innerHTML = "<p class=\"no-items\">لا توجد أصناف متاحة</p>";
    return;
  }

  list.forEach((item, index) => {
    const id = `customer-item-${index}`;
    const box = document.createElement("div");
    box.className = "customer-item-box";
    box.innerHTML = `
      <div class="item-info">
        <input type="checkbox" id="${id}" onchange="toggleCustomerItem(${index}, this.checked)">
        <label for="${id}">
          <span class="item-name">${item.name}</span>
          <span class="item-price">${item.price.toLocaleString()} ل.ل</span>
        </label>
      </div>
      ${item.features && item.features.length > 0 ? `
        <div class="features-section">
          <p class="features-title">اختر الخصائص:</p>
          <div class="features-list">
            ${item.features.map((feature, featureIndex) => `
              <label class="feature-checkbox">
                <input type="checkbox" id="feature-${index}-${featureIndex}" 
                       onchange="updateItemFeatures(${index}, '${feature}', this.checked)">
                <span>${feature}</span>
              </label>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
    listContainer.appendChild(box);
  });
}

// فلترة الأصناف للزبون
function filterCustomerItems() {
  const search = document.getElementById("search-box").value.toLowerCase();
  const filtered = items.filter(i => i.name.toLowerCase().includes(search));
  renderCustomerItems(filtered);
}

// إضافة/إزالة صنف من طلب الزبون
function toggleCustomerItem(index, checked) {
  const item = items[index];
  if (checked) {
    selectedItems.push({ ...item, quantity: 1 });
  } else {
    selectedItems = selectedItems.filter(i => i.id !== item.id);
  }
  renderCustomerOrder();
}

// عرض طلب الزبون
function renderCustomerOrder() {
  const container = document.getElementById("customer-order-preview");
  if (!container) return;
  
  container.innerHTML = "";

  if (selectedItems.length === 0) {
    container.innerHTML = "<p class=\"empty-order\">لم تختر أي أصناف بعد</p>";
    document.getElementById("customer-total").innerText = "المجموع الكلي: 0 ل.ل";
    return;
  }

  selectedItems.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "order-item-row";
    row.innerHTML = `
      <div class="item-details">
        <span class="item-name">${item.name}</span>
        <span class="item-price">${item.price.toLocaleString()} ل.ل</span>
      </div>
      <div class="quantity-controls">
        <button onclick="updateCustomerQty(${idx}, ${item.quantity - 1})" class="qty-btn">-</button>
        <span class="qty-display">${item.quantity}</span>
        <button onclick="updateCustomerQty(${idx}, ${item.quantity + 1})" class="qty-btn">+</button>
      </div>
    `;
    container.appendChild(row);
  });

  calculateCustomerTotal();
}

// تحديث كمية صنف في طلب الزبون
function updateCustomerQty(index, newQty) {
  if (newQty < 1) {
    selectedItems.splice(index, 1);
  } else {
    selectedItems[index].quantity = newQty;
  }
  renderCustomerOrder();
}

// حساب المجموع للزبون
function calculateCustomerTotal() {
  let total = 0;
  selectedItems.forEach(item => {
    total += item.price * item.quantity;
  });
  document.getElementById("customer-total").innerText = "المجموع الكلي: " + total.toLocaleString() + " ل.ل";
}

// إرسال طلب الزبون عبر واتساب
function sendCustomerOrder() {
  const customerName = document.getElementById("customer-name")?.value;
  const customerAddress = document.getElementById("customer-address")?.value;
  const customerPhone = document.getElementById("customer-phone")?.value;
  
  if (selectedItems.length === 0) {
    showNotification("يرجى اختيار أصناف للطلب أولاً", "warning");
    return;
  }
  
  if (!customerName || !customerAddress) {
    showNotification("يرجى إدخال الاسم والعنوان", "error");
    return;
  }
  
  let message = `🍽️ *CAVE RESTAURANT* 🍽️\n\n`;
  message += `🧍 *اسم الزبون:* ${customerName}\n`;
  message += `🏠 *العنوان:* ${customerAddress}\n`;
  if (customerPhone) {
    message += `📞 *الهاتف:* ${customerPhone}\n`;
  }
  message += `\n📋 *تفاصيل الطلب:*\n`;
  message += `═══════════════════\n\n`;
  
  selectedItems.forEach(item => {
    message += `🍽️ *${item.name}*\n`;
    message += `🔢 الكمية: ${item.quantity}\n`;
    message += `💰 السعر: ${(item.price * item.quantity).toLocaleString()} ل.ل\n`;
    if (item.selectedFeatures && item.selectedFeatures.length > 0) {
      message += `✅ الخصائص: ${item.selectedFeatures.join(', ')}\n`;
    }
    message += `\n`;
  });
  
  let total = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  message += `═══════════════════\n`;
  message += `💰 *المجموع الكلي: ${total.toLocaleString()} ل.ل* 💰\n\n`;
  message += `شكراً لطلبكم من CAVE RESTAURANT! 🎉\n`;
  message += `سيتم التواصل معكم قريباً 📞`;
  
  // أرقام الواتساب - يمكن تغييرها حسب الحاجة
  const phoneNumbers = [
    "96171636263", // الرقم الأول
    
  ];
  
  // إرسال الرسالة إلى جميع الأرقام
  phoneNumbers.forEach(phoneNumber => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  });
}

// تحديث خصائص الصنف المحدد
function updateItemFeatures(itemIndex, feature, checked) {
  const item = selectedItems.find(i => i.id === items[itemIndex].id);
  if (item) {
    if (!item.selectedFeatures) {
      item.selectedFeatures = [];
    }
    
    if (checked) {
      if (!item.selectedFeatures.includes(feature)) {
        item.selectedFeatures.push(feature);
      }
    } else {
      item.selectedFeatures = item.selectedFeatures.filter(f => f !== feature);
    }
  }
}

// مسح طلب الزبون
function clearCustomerOrder() {
  selectedItems = [];
  renderCustomerOrder();
  // إلغاء تحديد جميع الصناديق
  document.querySelectorAll('#customer-items-list input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

// فلترة الأصناف في واجهة الإدارة
function filterItems() {
  const search = document.getElementById("search-box").value.toLowerCase();
  const filtered = items.filter(i => i.name.toLowerCase().includes(search));
  renderItems(filtered);
}

// عرض الأصناف في واجهة الإدارة
function renderItems(list = items) {
  const listContainer = document.getElementById("items-list");
  if (!listContainer) return;
  
  listContainer.innerHTML = "";

  if (list.length === 0) {
    listContainer.innerHTML = "<p class=\"no-items\">لا توجد أصناف</p>";
    return;
  }

  list.forEach((item, index) => {
    const id = `item-${index}`;
    const box = document.createElement("div");
    box.className = "item-box";
    box.innerHTML = `
      <div class="item-info">
        <input type="checkbox" id="${id}" onchange="toggleItem(${index}, this.checked)">
        <label for="${id}">
          <span class="item-name">${item.name}</span>
          <span class="item-price">${item.price.toLocaleString()} ل.ل</span>
        </label>
      </div>
      ${item.features && item.features.length > 0 ? `<p class="item-features">الخصائص: ${item.features.join(', ')}</p>` : ''}
      <button onclick="deleteItem(${index})" class="delete-btn">🗑️ حذف</button>
    `;
    listContainer.appendChild(box);
  });
}

// إضافة/إزالة صنف من الطلب في واجهة الإدارة
function toggleItem(index, checked) {
  const item = items[index];
  if (checked) {
    selectedItems.push({ ...item, quantity: 1 });
  } else {
    selectedItems = selectedItems.filter(i => i.id !== item.id);
  }
  renderSelected();
}

// عرض الطلب المحدد في واجهة الإدارة
function renderSelected() {
  const container = document.getElementById("order-preview");
  if (!container) return;
  
  container.innerHTML = "";

  selectedItems.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "order-item-row";
    row.innerHTML = `
      <div class="item-details">
        <span class="item-name">${item.name}</span>
        <span class="item-price">${item.price.toLocaleString()} ل.ل</span>
      </div>
      <div class="quantity-controls">
        <button onclick="updateQty(${idx}, ${item.quantity - 1})" class="qty-btn">-</button>
        <span class="qty-display">${item.quantity}</span>
        <button onclick="updateQty(${idx}, ${item.quantity + 1})" class="qty-btn">+</button>
      </div>
    `;
    container.appendChild(row);
  });

  calculateTotal();
}

// تحديث كمية في واجهة الإدارة
function updateQty(index, newQty) {
  if (newQty < 1) {
    selectedItems.splice(index, 1);
  } else {
    selectedItems[index].quantity = newQty;
  }
  renderSelected();
}

// حساب المجموع في واجهة الإدارة
function calculateTotal() {
  let total = 0;
  selectedItems.forEach(item => {
    total += item.price * item.quantity;
  });
  const totalDisplay = document.getElementById("total-display");
  if (totalDisplay) {
    totalDisplay.innerText = "المجموع الكلي: " + total.toLocaleString() + " ل.ل";
  }
}

// حذف صنف
function deleteItem(index) {
  if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
    items.splice(index, 1);
    saveItems();
    renderItems();
  }
}

// مسح الطلب في واجهة الإدارة
function clearOrder() {
  selectedItems = [];
  renderSelected();
  // إلغاء تحديد جميع الصناديق
  document.querySelectorAll('#items-list input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

// طباعة الطلب
function printOrder() {
  if (selectedItems.length === 0) {
    showNotification("لا توجد أصناف محددة للطباعة", "warning");
    return;
  }
  
  let content = `CAVE RESTAURANT\n`;
  content += `═══════════════════\n\n`;
  content += `التاريخ: ${new Date().toLocaleDateString('ar-LB')}\n`;
  content += `الوقت: ${new Date().toLocaleTimeString('ar-LB')}\n`;
  content += `═══════════════════\n\n`;
  
  content += selectedItems.map(item =>
    `${item.name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ل.ل`
  ).join("\n");

  let total = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  content += "\n\n═══════════════════\n";
  content += "المجموع: " + total.toLocaleString() + " ل.ل";

  let win = window.open("", "", "height=700,width=900");
  win.document.write(`
  <html>
    <head>
      <style>
        body {
          font-size: 22px;
          font-family: 'Arial', sans-serif;
          direction: rtl;
          padding: 20px;
          text-align: center;
        }
        .restaurant-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .divider {
          border-top: 2px solid #000;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <pre>${content}</pre>
    </body>
  </html>
`);
  win.print();
}