import Hash "mo:base/Hash";
import Int "mo:base/Int";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
    // Types
    type Message = {
        sender: Text;
        content: Text;
        timestamp: Int;
    };

    type Channel = {
        name: Text;
        messages: Buffer.Buffer<Message>;
    };

    // State
    let channels = HashMap.HashMap<Text, Channel>(10, Text.equal, Text.hash);

    // Helper functions
    func getOrCreateChannel(name: Text) : Channel {
        switch (channels.get(name)) {
            case null {
                let newChannel = {
                    name = name;
                    messages = Buffer.Buffer<Message>(0);
                };
                channels.put(name, newChannel);
                newChannel
            };
            case (?existingChannel) existingChannel;
        };
    };

    // Public functions
    public func createChannel(name: Text) : async () {
        if (Option.isNull(channels.get(name))) {
            let newChannel = {
                name = name;
                messages = Buffer.Buffer<Message>(0);
            };
            channels.put(name, newChannel);
        };
    };

    public query func getChannels() : async [Text] {
        Iter.toArray(channels.keys());
    };

    public shared(msg) func sendMessage(channelName: Text, content: Text, sender: Text) : async () {
        let channel = getOrCreateChannel(channelName);
        let message = {
            sender = sender;
            content = content;
            timestamp = Time.now();
        };
        channel.messages.add(message);
    };

    public query func getMessages(channelName: Text) : async [Message] {
        switch (channels.get(channelName)) {
            case null [];
            case (?channel) Buffer.toArray(channel.messages);
        };
    };

    // System functions
    system func preupgrade() {
        // Implement if needed
    };

    system func postupgrade() {
        // Implement if needed
    };
};
