class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            fullscreenButton: document.querySelector('.fullscreen__button'),
            fullscreenCloseButton: document.querySelector('.fullscreen__close'),
            chatBox: document.querySelector('.chatbox__support'),
            fullscreenChat: document.querySelector('.chatbox__fullscreen'),
            sendButton1: document.querySelectorAll('.send__button')[0],
            sendButton2: document.querySelectorAll('.send__button')[1]
        }

        console.log(this.args);

        this.chatBoxState = false;
        this.fullscreenState = false;
        this.messages = [];
    }

    display() {
        const {openButton, fullscreenButton, fullscreenCloseButton, chatBox, fullscreenChat, sendButton1, sendButton2} = this.args

        openButton.addEventListener("click", () => this.toggleChatBoxState(chatBox));
        fullscreenButton.addEventListener("click", () => this.toggleFullscreenState(fullscreenChat));
        fullscreenCloseButton.addEventListener("click", () => this.toggleFullscreenState(fullscreenChat));
        sendButton1.addEventListener('click', () => this.onSendButton(chatBox, fullscreenChat));
        sendButton2.addEventListener('click', () => this.onSendButton(chatBox, fullscreenChat));

        const node1 = chatBox.querySelector('input');
        const node2 = fullscreenChat.querySelector('input');

        node1.addEventListener("keyup", ({key}) => {
            if (key == "Enter") {
                this.onSendButton(chatBox, fullscreenChat)
            }
        })

        node2.addEventListener("keyup", ({key}) => {
            if (key == "Enter") {
                this.onSendButton(chatBox, fullscreenChat)
            }
        })
    }

    toggleChatBoxState(chatbox) {
        

        this.chatBoxState = !this.chatBoxState;

        if (this.chatBoxState) {
            chatbox.classList.add('chatbox--active')
        }
        else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    toggleFullscreenState(fullscreeenChat) {
        

        this.fullscreenState = !this.fullscreenState;

        if (this.fullscreenState) {
            fullscreeenChat.classList.add('fullscreen--active')
        }
        else {
            fullscreeenChat.classList.remove('fullscreen--active')
        }
    }

    onSendButton(chatbox, fullscreenChat) {
        var textField1 = chatbox.querySelector('input');
        var textField2 = fullscreenChat.querySelector('input');
        let text1 = "";
        if (textField1.value === "") {
            text1 = textField2.value;
        }
        else if (textField2.value === "") {
            text1 = textField1.value;
        }
        else {
            return;
        }

        let msg1 = { name: "User", message: text1, link: false};

        this.messages.push(msg1);
        
        textField1.value = '';
        textField2.value = '';
        this.updateChatText(chatbox, fullscreenChat);


        fetch($SCRIPT_ROOT + '/predict' , {
            method: 'POST',
            body: JSON.stringify({ message: text1}),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            console.log(r.answer);

            let msg2 = { name: "Sam", message: r.answer};
            console.log(msg2.message);

            this.messages.push(msg2);
            this.updateChatText(chatbox, fullscreenChat);
            textField1.value = '';
            textField2.value = '';
        }).catch((error) => {
            console.error( 'Error:', error);
            this.updateChatText(chatbox);
            textField1.value = '';
            textField2.value = '';
        });

         
    }

    updateChatText(chatbox, fullscreeenChat) {
        var html = '';
        console.log(this.messages);
        this.messages.slice().reverse().forEach(function(item,) {
            if (item.name === "Sam")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'

            }
            else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        });

        const chatmessage1 = chatbox.querySelector('.chatbox__messages');
        chatmessage1.innerHTML = html
        const chatmessage2 = fullscreeenChat.querySelector('.chatbox__messages');
        chatmessage2.innerHTML = html


        console.log(chatmessage1.innerHTML)

    }

}

const chatbox = new Chatbox()

chatbox.display()

/*
// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
*/