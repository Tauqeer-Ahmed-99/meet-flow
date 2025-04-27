import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Users, Lock, Globe, Shield, Settings } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import MediaPreviewDialog from "../components/MediaPreviewDialog";

const Landing: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [pendingMeetingCode, setPendingMeetingCode] = useState("");
  const navigate = useNavigate();

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      setPendingMeetingCode(meetingCode);
      setShowPreview(true);
    }
  };

  const handleCreateMeeting = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPendingMeetingCode(randomCode);
    setShowPreview(true);
  };

  const handleJoinAfterPreview = (title: string) => {
    navigate(`/meeting/${pendingMeetingCode}${title ? `?title=${title}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#2D3B55]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a')] opacity-5 mix-blend-overlay"></div>
      <div className="relative">
        <div className="min-h-screen absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 backdrop-blur-[200px]"></div>
        <div className="relative p-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-2">
              <Video className="w-8 h-8 text-violet-400" />
              <span className="text-2xl font-bold text-white">MeetFlow</span>
            </div>
            <div className="flex items-center space-x-6">
              <button className="transition-colors text-violet-200 hover:text-white">
                About
              </button>
              <SignedOut>
                <SignInButton>
                  <button className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-6 py-2.5 rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-indigo-500/25">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button className="w-8 h-8 text-violet-400">
                  <Settings
                    onClick={() => {
                      setShowPreview(!showPreview);
                      setIsSettingsOpen(!isSettingsOpen);
                    }}
                  />
                </button>
                <UserButton />
              </SignedIn>
            </div>
          </nav>

          <div className="grid items-center gap-16 mt-8 lg:grid-cols-2">
            <div className="relative">
              <div className="absolute w-1/2 rounded-full -top-20 -left-20 h-1/2 bg-violet-500/30 filter blur-3xl"></div>
              <div className="absolute w-1/2 rounded-full bottom-20 right-20 h-1/2 bg-indigo-500/30 filter blur-3xl"></div>
              <div className="relative">
                <h1 className="mb-6 text-6xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-indigo-200">
                  Professional Video Meetings for Everyone
                </h1>
                <p className="mb-12 text-xl text-violet-200">
                  Connect with your team seamlessly through high-quality video
                  conferencing. Start or join a meeting with just one click.
                </p>
                <SignedOut>
                  <div className="space-y-6">
                    <SignInButton>
                      <button className="w-full px-6 py-4 text-white transition-all duration-300 border rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-lg border-white/10">
                        Get Started
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
                <SignedIn>
                  <div className="space-y-6">
                    <form onSubmit={handleJoinMeeting} className="flex gap-4">
                      <input
                        type="text"
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value)}
                        placeholder="Enter meeting code"
                        className="flex-1 px-6 py-4 text-white rounded-lg bg-white/10 placeholder-violet-200/60 focus:outline-none focus:ring-2 focus:ring-violet-400 backdrop-blur-lg"
                      />
                      <button
                        type="submit"
                        className="px-8 py-4 text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-indigo-500/25"
                      >
                        Join Meeting
                      </button>
                    </form>

                    <div className="flex items-center">
                      <div className="flex-1 border-t border-violet-200/10"></div>
                      <span className="px-4 text-violet-200/60">or</span>
                      <div className="flex-1 border-t border-violet-200/10"></div>
                    </div>

                    <button
                      onClick={handleCreateMeeting}
                      className="w-full px-6 py-4 text-white transition-all duration-300 border rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-lg border-white/10"
                    >
                      Create New Meeting
                    </button>
                  </div>
                </SignedIn>
              </div>
            </div>

            <div className="hidden grid-cols-2 gap-6 lg:grid">
              <div className="space-y-6">
                <div className="p-8 transition-all duration-300 transform border bg-white/5 rounded-2xl backdrop-blur-lg border-white/10 hover:scale-105">
                  <Users className="w-10 h-10 mb-4 text-violet-400" />
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Up to 100 Participants
                  </h3>
                  <p className="text-violet-200">
                    Host large meetings with crystal-clear video quality
                  </p>
                </div>
                <div className="p-8 transition-all duration-300 transform border bg-white/5 rounded-2xl backdrop-blur-lg border-white/10 hover:scale-105">
                  <Lock className="w-10 h-10 mb-4 text-violet-400" />
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Secure Meetings
                  </h3>
                  <p className="text-violet-200">
                    End-to-end encryption for all your conversations
                  </p>
                </div>
              </div>
              <div className="mt-12 space-y-6">
                <div className="p-8 transition-all duration-300 transform border bg-white/5 rounded-2xl backdrop-blur-lg border-white/10 hover:scale-105">
                  <Globe className="w-10 h-10 mb-4 text-violet-400" />
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Global Access
                  </h3>
                  <p className="text-violet-200">
                    Connect from anywhere in the world
                  </p>
                </div>
                <div className="p-8 transition-all duration-300 transform border bg-white/5 rounded-2xl backdrop-blur-lg border-white/10 hover:scale-105">
                  <Shield className="w-10 h-10 mb-4 text-violet-400" />
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Privacy First
                  </h3>
                  <p className="text-violet-200">
                    Your data stays private and protected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <DevicesSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      /> */}
      <MediaPreviewDialog
        isOpen={showPreview}
        isSettingsOpen={isSettingsOpen}
        isJoining={!!meetingCode.trim()}
        onClose={() => {
          setShowPreview(false);
          setIsSettingsOpen(false);
        }}
        onJoin={(title) => handleJoinAfterPreview(title)}
      />
    </div>
  );
};

export default Landing;
