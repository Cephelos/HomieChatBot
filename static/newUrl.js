

class UrlBox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton} = this.args

        openButton.addEventListener("click", () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');

        node.addEventListener("keyup", ({key}) => {
            if (key == "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        

        this.state = !this.state;

        if (this.state) {
            chatbox.classList.add('chatbox--active')
        }
        else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value

        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1}

        this.messages.push(msg1);
        
        textField.value = ''
        this.updateChatText(chatbox)


        fetch($SCRIPT_ROOT + '/create_index' , {
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

            let msg2 = { name: "Sam", message: r.answer };
            console.log(msg2.message);
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''
        }).catch((error) => {
            console.error( 'Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
        });

         
    }

    updateChatText(chatbox) {
        var html = '';
        console.log(this.messages)
        this.messages.slice().reverse().forEach(function(item,) {
            if (item.name === "Sam")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        });


        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html

        console.log(chatmessage.innerHTML)

    }

}

const chatbox = new UrlBox()

chatbox.display()
