const firebaseConfig = {
  apiKey: "AIzaSyDmARGTPwXAOISComZKLaRx8RSXXnnvXbA",
    authDomain: "satganzdevs-596e7.firebaseapp.com",
    databaseURL: "https://satganzdevs-596e7-default-rtdb.firebaseio.com",
    projectId: "satganzdevs-596e7",
    storageBucket: "satganzdevs-596e7.appspot.com",
    messagingSenderId: "851869836628",
    appId: "1:851869836628:web:922f8495577d6a15f314c1",
    measurementId: "G-Q2VBQXTDZD"
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

// Mencatat status pengguna ketika mengetik
function handleTyping() {
  var user = firebase.auth().currentUser;
  typingRef.child(user.uid).set(user.displayName);
  setTimeout(function() {
    typingRef.child(user.uid).remove();
  }, 2000);
}
// Mengirim Pesan
function sendMessage(e) {
  e.preventDefault();

  var messageInput = document.getElementById('message-input');
  var message = messageInput.value;
  var user = firebase.auth().currentUser;

  // Check if the user is logged in
  if (message && user) {
    var newMessageRef = messagesRef.push();
    newMessageRef.set({
      sender: localStorage.getItem("username"),
      content: message
    });

    messageInput.value = '';
  } else {
    // Handle the case when the user is not logged in
    window.swal({
        title: 'Hai kak',
        text: 'Login Dulu kak',
      })
    window.location.href = "index.html";
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
  contentElement.textContent = message.content;
  messageElement.appendChild(senderElement);
  messageElement.appendChild(contentElement);
  chatContainer.appendChild(messageElement);

  if (message.sender !== currentUser) {
    incomingSound.play();
  }

  // Mengatur timeout untuk menghapus pesan setelah 24 jam
  setTimeout(function() {
    snapshot.ref.remove();
  }, 24 * 60 * 60 * 1000); // 24 jam dalam milidetik
});

// JavaScript yang sudah ada sebelumnya

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
