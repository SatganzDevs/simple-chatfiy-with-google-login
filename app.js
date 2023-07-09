const firebaseConfig = {
  apiKey: "AIzaSyAT9VvvF2qCxrVZZme6WIWMik4ooQDM3wI",
  authDomain: "anjas-6e82c.firebaseapp.com",
  databaseURL: "https://anjas-6e82c-default-rtdb.firebaseio.com",
  projectId: "anjas-6e82c",
  storageBucket: "anjas-6e82c.appspot.com",
  messagingSenderId: "849134901980",
  appId: "1:849134901980:web:c5ffc8edf400bcf4587219",
  measurementId: "G-8NHCJGQCS1"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Referensi Firebase Realtime Database
var messagesRef = firebase.database().ref('messages');
var typingRef = firebase.database().ref('typing');
var incomingSound = new Audio('notif.mp3');

// Menangani pengiriman pesan
document.getElementById('message-form').addEventListener('submit', sendMessage);

// Menangani kejadian ketika pengguna mengetik
document.getElementById('message-input').addEventListener('input', handleTyping);

function getCurrentDateTime() {
  var now = new Date();
  var dateTimeString = now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + ', ' + now.toLocaleDateString('en-US');
  return dateTimeString;
}

function handleTyping() {
  var user = localStorage.getItem("username");
  typingRef.child(user).set(user);
  setTimeout(function() {
    typingRef.child(user).remove();
  }, 2000);
}

function sendMessage(e) {
  e.preventDefault();

  var messageInput = document.getElementById('message-input');
  var message = messageInput.value;
  var user = localStorage.getItem("username");

  // Periksa apakah pengguna sudah login dan ada pesan yang diketik
  if (message && user) {
    // Kirim pesan ke Firebase Realtime Database
    var newMessageRef = messagesRef.push();
    newMessageRef.set({
      sender: user,
      content: message,
      timestamp: getCurrentDateTime()
    });

    messageInput.value = ''; // Bersihkan input pesan setelah terkirim
  } else if (!message) {
    // Handle ketika tidak ada pesan yang diketik
    window.swal({
      title: 'Perhatian',
      text: 'Pesan kosong. Mohon masukkan pesan Anda.',
    });
  } else {
    // Handle ketika pengguna belum login
    window.swal({
      title: 'Perhatian',
      text: 'Anda belum login. Silakan login terlebih dahulu.',
    });
    window.location.href = "index.html"; // Ganti dengan halaman login yang sesuai
  }
}

// Membaca pesan dari Firebase Realtime Database
messagesRef.on('child_added', function(snapshot) {
  var message = snapshot.val();
  var chatContainer = document.getElementById('chat-container');
  var messageElement = document.createElement('div');
  messageElement.className = 'message';
  var currentUser = localStorage.getItem('username');
  var senderElement = document.createElement('span');
  senderElement.className = 'sender';
  senderElement.style.fontWeight = 'bold';
  senderElement.textContent = message.sender + ': ';

  var contentElement = document.createElement('span');
  contentElement.className = 'content';
  contentElement.textContent = message.content;

  var timeElement = document.createElement('span');
  timeElement.className = 'time';
  timeElement.textContent = message.timestamp; // Memperoleh waktu pesan

  messageElement.appendChild(senderElement);
  messageElement.appendChild(contentElement);
  messageElement.appendChild(timeElement);
  chatContainer.appendChild(messageElement);

  if (message.sender !== currentUser) {
    incomingSound.play();
  }

  // Mengatur timeout untuk menghapus pesan setelah 24 jam
  setTimeout(function() {
    snapshot.ref.remove();
  }, 24 * 60 * 60 * 1000); // 24 jam dalam milidetik

  // Scroll ke bawah untuk melihat pesan terbaru
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

// Menerima perubahan status ketik dari pengguna lain
typingRef.on('child_added', function(snapshot) {
  var typingUser = snapshot.val();
  var user = firebase.auth().currentUser;
  if (typingUser && user && user.displayName !== typingUser) {
    displayTypingStatus(typingUser);
  }
});

// Menghapus status ketik saat pengguna berhenti mengetik
typingRef.on('child_removed', function(snapshot) {
  var typingUser = snapshot.val();
  var user = firebase.auth().currentUser;
  if (typingUser && user && user.displayName !== typingUser) {
    hideTypingStatus();
  }
});

// Menampilkan status ketik
function displayTypingStatus(typingUser) {
  var typingStatus = document.getElementById('typing-status');
  var typingText = document.getElementById('typing-text');
  typingText.textContent = typingUser + ' is typing...';
  typingStatus.classList.add('typing-active'); // Menambahkan kelas CSS untuk mengaktifkan animasi
}

// Menghilangkan status ketik
function hideTypingStatus() {
  var typingStatus = document.getElementById('typing-status');
  var typingText = document.getElementById('typing-text');
  typingText.textContent = '';
  typingStatus.classList.remove('typing-active'); // Menghapus kelas CSS untuk menonaktifkan animasi
}
