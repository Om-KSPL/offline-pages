// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.error('ServiceWorker registration failed: ', err);
        });
    });
}

// Listen for form submission
document.getElementById('offlineForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        interest: document.getElementById('interest').value,
        comment: document.getElementById('comment').value
    };
    if((formData.name + formData.email + formData.phone + formData.interest + formData.comment).trim().length > 0)
    // Save data locally
        saveDataLocally(formData);

    showDataLocally()
    // Reset form
    document.getElementById('offlineForm').reset();
});


// Function to save data locally
function saveDataLocally(data) {
    if (!('indexedDB' in self)) {
        console.error('IndexedDB is not supported.');
        return;
    }

    const request = indexedDB.open('offlineFormDataDB', 1);

    request.onerror = function(event) {
        console.error('Database error:', event.target.error);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('formData', 'readwrite');
        const objectStore = transaction.objectStore('formData');

        const addRequest = objectStore.add(data);
        
        addRequest.onsuccess = function(event) {
            console.log('Data added locally.');
        };

        addRequest.onerror = function(event) {
            console.error('Error adding data:', event.target.error);
        };

        // Check if navigator is online, if yes, register sync
        // if (navigator.onLine) {
        //     registerSync();
        // }
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.controller.postMessage('syncFormData');
        }
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('formData', { keyPath: 'id', autoIncrement: true });
    };
}


// // Function to save data locally
// function saveDataLocally(data) {
//     // Check if browser supports local storage
//     if (typeof(Storage) !== 'undefined') {
//         let savedData = JSON.parse(localStorage.getItem('offlineFormData')) || [];
//         savedData.push(data);
//         localStorage.setItem('offlineFormData', JSON.stringify(savedData));
        
//         // Check if navigator is online, if yes, register sync
//         if (navigator.onLine) {
//             registerSync();
//         }
//     } else {
//         console.error('Local storage is not supported.');
//     }
// }

// Register sync event
function registerSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(function(registration) {
            return registration.sync.register('syncFormData');
        }).catch(function(err) {
            console.error('Sync registration failed:', err);
        });
    }
}

// Listen for online event
window.addEventListener('online', function(event) {
    registerSync();
});

function getDataLocally(){
    return JSON.parse(localStorage.getItem('offlineFormData')) || [];
}

function showDataLocally(){
    var savedData = getDataLocally();
    var html = "<table>";
    var header = "<tr>";
    header += "<th>name</th>";
    header += "<th>email</th>";
    header += "<th>phone</th>";
    header += "<th>interest</th>";
    header += "<th>comment</th>";
    header += "</tr>";
    html += header;

    savedData.forEach( data => {
        var row = "<tr>"
        row += "<td>"+data['name'] + "</td>"
        row += "<td>"+data['email'] + "</td>"
        row += "<td>"+data['phone'] + "</td>"
        row += "<td>"+data['interest'] + "</td>"
        row += "<td>"+data['comment'] + "</td>"
        row += "</tr>"
        html += row
    })
    html += "</table>";

    document.getElementById('savedData').innerHTML=html
}

showDataLocally()