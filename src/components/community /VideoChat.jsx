import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VideoChat({ mangaId, mangaTitle }) {
  const queryClient = useQueryClient();
  const [isInSession, setIsInSession] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: activeSessions = [] } = useQuery({
    queryKey: ['video-sessions', mangaId],
    queryFn: () => base44.entities.VideoSession.filter({ manga_id: mangaId, status: 'active' }),
    enabled: !!mangaId,
    refetchInterval: 3000,
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return await base44.entities.VideoSession.create({
        host_email: user.email,
        host_name: user.full_name,
        participants: [user.email],
        manga_id: mangaId,
        manga_title: mangaTitle,
        current_chapter: 1,
        status: 'active',
        room_id: roomId,
      });
    },
    onSuccess: () => {
      toast.success('Video session started!');
      queryClient.invalidateQueries({ queryKey: ['video-sessions'] });
      startLocalVideo();
    },
  });

  const joinSession = useMutation({
    mutationFn: async (sessionId) => {
      const session = activeSessions.find(s => s.id === sessionId);
      const updatedParticipants = [...(session.participants || []), user.email];
      return await base44.entities.VideoSession.update(sessionId, {
        participants: updatedParticipants,
      });
    },
    onSuccess: () => {
      toast.success('Joined video session!');
      startLocalVideo();
    },
  });

  const endSession = useMutation({
    mutationFn: async (sessionId) => {
      return await base44.entities.VideoSession.update(sessionId, { status: 'ended' });
    },
    onSuccess: () => {
      toast.success('Session ended');
      stopLocalVideo();
      queryClient.invalidateQueries({ queryKey: ['video-sessions'] });
    },
  });

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsInSession(true);
    } catch (error) {
      toast.error('Failed to access camera/microphone');
      console.error('Media access error:', error);
    }
  };

  const stopLocalVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsInSession(false);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  useEffect(() => {
    return () => {
      stopLocalVideo();
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Video className="w-5 h-5 text-violet-400" />
        Watch Together
      </h2>

      {!isInSession ? (
        <div className="space-y-4">
          <div className="bg-[hsl(222,47%,9%)] rounded-xl p-4 space-y-4">
            <p className="text-sm text-[hsl(215,15%,65%)]">
              Start a video session to read manga or watch anime together with friends!
            </p>
            
            <Button
              onClick={() => createSession.mutate()}
              disabled={createSession.isPending}
              className="bg-violet-600 hover:bg-violet-700 w-full gap-2"
            >
              {createSession.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              Start Video Session
            </Button>
          </div>

          {activeSessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[hsl(215,15%,55%)]">Active Sessions</h3>
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-[hsl(222,47%,9%)] rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{session.host_name}'s session</p>
                    <p className="text-xs text-[hsl(215,15%,45%)] flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {session.participants?.length || 1} participants
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => joinSession.mutate(session.id)}
                    disabled={joinSession.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[hsl(222,47%,9%)] rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                You
              </div>
            </div>
            <div className="relative aspect-video bg-[hsl(222,47%,12%)] rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[hsl(215,15%,45%)]">
                <Users className="w-12 h-12" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              size="icon"
              variant="outline"
              onClick={toggleMute}
              className={isMuted ? 'bg-red-500/20 border-red-500' : ''}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={toggleVideo}
              className={isVideoOff ? 'bg-red-500/20 border-red-500' : ''}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => {
                const mySession = activeSessions.find(s => s.host_email === user.email);
                if (mySession) {
                  endSession.mutate(mySession.id);
                } else {
                  stopLocalVideo();
                }
              }}
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-center text-[hsl(215,15%,45%)]">
            Note: Full WebRTC peer-to-peer connection requires additional setup. This is a basic UI demonstration.
          </p>
        </div>
      )}
    </div>
  );
}
