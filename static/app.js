class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            fullscreenButton: document.querySelector('.fullscreen__button'),
            fullscreenCloseButton: document.querySelector('.fullscreen__close'),
            enlargeButton: document.querySelector('.enlarge__button'),
            chatBox: document.querySelector('.chatbox__support'),
            fullscreenChat: document.querySelector('.chatbox__fullscreen'),
            lightbox: document.querySelector('.lightbox'),
            sendButton1: document.querySelectorAll('.send__button')[0],
            sendButton2: document.querySelectorAll('.send__button')[1]
        }

        console.log(this.args);

        this.chatBoxState = false;
        this.chatBoxEnlargedState = false;
        this.fullscreenState = false;
        this.messages = [];
    }

    display() {
        const {openButton, fullscreenButton, fullscreenCloseButton, enlargeButton, chatBox, fullscreenChat, lightbox, sendButton1, sendButton2} = this.args

        console.log(fullscreenChat);
        openButton.addEventListener("click", () => this.toggleChatBoxState(chatBox));
        fullscreenButton.addEventListener("click", () => this.toggleFullscreenState(fullscreenChat, lightbox));
        fullscreenButton.addEventListener("click", () => this.toggleChatBoxState(chatBox));
        fullscreenCloseButton.addEventListener("click", () => this.toggleFullscreenState(fullscreenChat, lightbox));
        fullscreenCloseButton.addEventListener("click", () => this.toggleChatBoxState(chatBox));
        // enlargeButton.addEventListener("click", () => this.toggleEnlargeState(chatBox));
        sendButton1.addEventListener('click', () => this.onSendButton(chatBox, fullscreenChat));
        sendButton2.addEventListener('click', () => this.onSendButton(chatBox, fullscreenChat));

        const node1 = chatBox.querySelector('input');
        const node2 = fullscreenChat.querySelector('input');

        node1.addEventListener("keyup", ({key}) => {
            if (key == "Enter") {
                this.onSendButton(chatBox, fullscreenChat);
            }
        })

        node2.addEventListener("keyup", ({key}) => {
            if (key == "Enter") {
                this.onSendButton(chatBox, fullscreenChat);
            }
        })
    }

    toggleChatBoxState(chatbox) {

        this.chatBoxState = !this.chatBoxState;

        if (this.chatBoxState) {
            chatbox.classList.add('chatbox--active');
        }
        else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    toggleEnlargeState(chatbox) {

        this.chatBoxEnlargedState = !this.chatBoxEnlargedState;

        if (this.chatBoxEnlargedState) {
            chatbox.classList.add('chatbox--enlarged');
        }
        else {
            chatbox.classList.remove('chatbox--enlarged');
        }
    }

    toggleFullscreenState(fullscreeenChat, lightbox) {
        

        this.fullscreenState = !this.fullscreenState;

        if (this.fullscreenState) {
            fullscreeenChat.classList.add('fullscreen--active');
            lightbox.classList.add('lightbox--active');
        }
        else {
            fullscreeenChat.classList.remove('fullscreen--active');
            lightbox.classList.remove('lightbox--active');
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
            this.updateChatText(chatbox, fullscreenChat);
            textField1.value = '';
            textField2.value = '';
        });

         
    }

    updateChatText(chatbox, fullscreenChat) {
        var html = '';
        console.log(fullscreenChat)
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
        const chatmessage2 = fullscreenChat.querySelector('.chatbox__messages');
        chatmessage2.innerHTML = html


        console.log(chatmessage1.innerHTML)

    }

}

const chatbox = new Chatbox()

chatbox.display()

