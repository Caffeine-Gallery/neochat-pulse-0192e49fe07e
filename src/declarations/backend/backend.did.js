export const idlFactory = ({ IDL }) => {
  const Message = IDL.Record({
    'content' : IDL.Text,
    'sender' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  return IDL.Service({
    'createChannel' : IDL.Func([IDL.Text], [], []),
    'getChannels' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getMessages' : IDL.Func([IDL.Text], [IDL.Vec(Message)], ['query']),
    'sendMessage' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
