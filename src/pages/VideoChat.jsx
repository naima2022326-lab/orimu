import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function VideoChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const friendEmail = urlParams.get('with');
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!user) return;
    const id = `${user.email}_${friendEmail}_${Date.now()}`.replace(/[^a-zA-Z0-9_]/g, '_');
    setRoomId(id);
  }, [user, friendEmail]);

  // Initialize video stream
  useEffect(() => {
    if (!roomId || !localVideoRef.current) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        toast.success('Camera and microphone enabled');
      })
      .catch(err => {
        console.error('Media error:', err);
        toast.error('Could not access camera/microphone');
      });

    return () => {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);

  const createSession = useMutation({
    mutationFn: () => base44.entities.VideoSession.create({
      host_email: user.email,
      host_name: user.full_name,
      participants: [friendEmail],
      room_id: roomId,
      status: 'active',
    }),
    onSuccess: () => {
      toast.success('Session started!');
    },
  });

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { user: user.full_name, text: message, time: new Date() }]);
    setMessage('');
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    toast.info('Call ended');
    window.history.back();
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen text-white">Please log in</div>;
  }

  return (
    <div className="min-h-screen bg-[hsl(222,47%,6%)] text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-violet-400" />
          <h1 className="text-xl font-bold">Video Chat with {friendEmail}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Video area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Remote video (large) */}
            <div className="relative aspect-video bg-[hsl(222,47%,9%)] rounded-2xl overflow-hidden border border-[hsl(222,30%,12%)]">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[hsl(215,15%,40%)]">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-2 opacity-40" />
                  <p>Waiting for {friendEmail}...</p>
                </div>
              </div>
            </div>

            {/* Local video (small) */}
            <div className="relative w-64 aspect-video bg-[hsl(222,47%,12%)] rounded-xl overflow-hidden border border-[hsl(222,30%,16%)]">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">You</div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={toggleVideo}
                size="lg"
                variant={videoEnabled ? 'default' : 'destructive'}
                className="rounded-full w-14 h-14"
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              <Button
                onClick={toggleAudio}
                size="lg"
                variant={audioEnabled ? 'default' : 'destructive'}
                className="rounded-full w-14 h-14"
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button
                onClick={endCall}
                size="lg"
                variant="destructive"
                className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Chat sidebar */}
          <div className="bg-[hsl(222,47%,9%)] rounded-2xl border border-[hsl(222,30%,12%)] flex flex-col h-[600px]">
            <div className="p-4 border-b border-[hsl(222,30%,12%)] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-[hsl(215,15%,45%)] text-center py-8">No messages yet</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-violet-400">{msg.user}</span>
                      <span className="text-xs text-[hsl(215,15%,45%)]">
                        {msg.time.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(210,20%,85%)]">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-[hsl(222,30%,12%)] flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)]"
              />
              <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700">
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Info banner */}
        <div className="mt-6 bg-violet-600/10 border border-violet-500/30 rounded-xl p-4 text-sm text-violet-300">
          <p><strong>Note:</strong> Video chat is a basic implementation. For production use, integrate a WebRTC service like Daily.co, Agora, or Twilio for peer-to-peer video streaming.</p>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
