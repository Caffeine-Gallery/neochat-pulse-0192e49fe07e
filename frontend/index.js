import { backend } from 'declarations/backend';
import { AuthClient } from "@dfinity/auth-client";

let authClient;
let currentChannel = 'general';
let username = 'Anonymous';

async function init() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        handleAuthenticated();
    } else {
        await authClient.login({
            identityProvider: "https://identity.ic0.app/#authorize",
            onSuccess: handleAuthenticated,
        });
    }
}

async function handleAuthenticated() {
    const identity = authClient.getIdentity();
    username = identity.getPrincipal().toText().slice(0, 5);
    await loadChannels();
    await joinChannel('general');
    setupEventListeners();
}

async function loadChannels() {
    const channels = await backend.getChannels();
    const channelList = document.getElementById('channelList');
    channelList.innerHTML = '';
    channels.forEach(channel => {
        const li = document.createElement('li');
        li.className = 'channel-item';
        li.innerHTML = `
            <i class="fas fa-hashtag channel-icon"></i>
            <span class="channel-name">${channel}</span>
        `;
        li.addEventListener('click', () => joinChannel(channel));
        channelList.appendChild(li);
    });
}

async function joinChannel(channel) {
    currentChannel = channel;
    document.getElementById('currentChannel').textContent = `#${channel}`;
    document.getElementById('messageInput').placeholder = `Message #${channel}`;
    await loadMessages(channel);
}

async function loadMessages(channel) {
    const messages = await backend.getMessages(channel);
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    messages.forEach(addMessageToUI);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addMessageToUI(message) {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="avatar">${message.sender.slice(0, 2).toUpperCase()}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="username">${message.sender}</span>
                <span class="timestamp">${new Date(Number(message.timestamp)).toLocaleTimeString()}</span>
            </div>
            <p class="message-text">${message.content}</p>
            <div class="message-actions">
                <span class="reaction">+ Add Reaction</span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setupEventListeners() {
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const addChannelBtn = document.getElementById('addChannelBtn');

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    addChannelBtn.addEventListener('click', createChannel);
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    if (content) {
        await backend.sendMessage(currentChannel, content, username);
        messageInput.value = '';
        await loadMessages(currentChannel);
    }
}

async function createChannel() {
    const channelName = prompt("Enter new channel name:");
    if (channelName) {
        await backend.createChannel(channelName);
        await loadChannels();
    }
}

init();
