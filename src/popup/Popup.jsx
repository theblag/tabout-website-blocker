import React from "react";
import { useState, useEffect } from "react";
import { Plus, X, Shield, Clock, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function Popup() {
  const [blockedSites, setBlockedSites] = useState([]);
  const [inputSite, setInputSite] = useState("")

  const [passwordSet, setPasswordSet] = useState(true); // assume it's set
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [errorMsgPassword, setErrorMsgPassword] = useState("");
  const [errorMsgDelete, setErrorMsgDelete] = useState("");

  const [inputHours, setInputHours] = useState("");
  const [inputMinutes, setInputMinutes] = useState("");

  const [remainingTimes, setRemainingTimes] = useState({});

  useEffect(() => {
    const updateRemainingTimes = () => {
      const now = Date.now();
      const updated = {};
      blockedSites.forEach((site) => {
        if (site.expiresAt) {
          const diff = site.expiresAt - now;
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            updated[site.site] = `${hours}:${minutes}:${seconds}`;
          } else {
            updated[site.site] = "Expired";
          }
        }
      });

      setRemainingTimes(updated);

    };

    updateRemainingTimes(); // initial call
    const timer = setInterval(updateRemainingTimes, 1000); // update every second

    return () => clearInterval(timer);
  }, [blockedSites]);



  useEffect(() => { //Trying to see if the password is stored in the Local storage
    chrome.storage.local.get("password", (result) => {

      if (!result.password) {
        setPasswordSet(false);
        setShowSetPasswordModal(true);
      }
      console.log("Password set:", result.password);

    });
    chrome.storage.local.get(["blockedSites"], (result) => {
      console.log("Blocked Sites List:", result.blockedSites);
    });

  }, []);

  // Fetch blocked sites on popup open
  useEffect(() => {
    chrome.storage.local.get(["blockedSites"], (result) => {
      setBlockedSites(result.blockedSites || []);
    });
  }, []);

  useEffect(() => {     // Filter out expired sites

    chrome.storage.local.get(["blockedSites"], (result) => {
      const allSites = result.blockedSites || [];

      const now = Date.now();
      const validSites = allSites.filter(siteObj => !siteObj.expiresAt || siteObj.expiresAt > now);

      setBlockedSites(validSites);

      if (validSites.length !== allSites.length) {
        chrome.storage.local.set({ blockedSites: validSites });
      }
    });
  }, []);

  const handleAddSite = () => {
    const site = inputSite.trim();
    const hours = parseInt(inputHours) || 0;
    const minutes = parseInt(inputMinutes) || 0;

    if (!site) {
      setErrorMsg("Please enter a valid site.");
      return
    }
    else if (hours === 0 && minutes === 0) {
      setErrorMsg("Enter a valid time")
      return
    }

    const totalMilliseconds = (hours * 60 + minutes) * 60 * 1000;
    const expiresAt = Date.now() + totalMilliseconds;

    const newEntry = { site, expiresAt };

    chrome.storage.local.get("blockedSites", (result) => {
      const existing = result.blockedSites || [];
      if (existing.some(entry => entry.site === site)) {
        setErrorMsg("This site is already blocked")
      };

      const updated = [...existing, newEntry];
      chrome.storage.local.set({ blockedSites: updated }, () => {
        setBlockedSites(updated);
        setInputSite("");
        setInputHours("");
        setInputMinutes("");
      });
    });

  };





  const handleDeleteSite = (site) => {
    setSiteToDelete(site);
    setShowDeleteModal(true);
    setDeleteReason("");
    setPasswordInput("");
    setErrorMsg("");
  };
  const handleSetPassword = () => {
    const trimmed = newPassword.trim();
    if (trimmed.length < 4) {
      setErrorMsgPassword("Password must be at least 4 characters long.");
      return
    }

    chrome.storage.local.set({ password: trimmed }, () => {
      setPasswordSet(true);
      setShowSetPasswordModal(false);
    });
    console.log("Password set:", trimmed);
  };

  const handleConfirmDelete = () => {
    if (deleteReason.trim().length < 15) {
      setErrorMsgDelete("Do you think its really worth it? Think again!");
      return;
    }

    chrome.storage.local.get("password", (result) => {
      if (result.password !== passwordInput) {
        setErrorMsgDelete("Incorrect password.");
        return;
      }

      const updatedList = blockedSites.filter((siteObj) => siteObj.site !== siteToDelete);
      chrome.storage.local.set({ blockedSites: updatedList }, () => {
        setBlockedSites(updatedList);
        setShowDeleteModal(false);
      });
    });
  };



  return (
    <div className="w-[360px] min-h-[540px] bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 top-0 left-0 pink-glow-pulse pointer-events-none"></div>
      <div className="absolute inset-0 top-0 left-0 purple-glow-pulse pointer-events-none"></div>

      {/* Set Password Modal */}

      {showSetPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Modal Container */}
          <div className="w-[400px] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-600/30 shadow-2xl relative overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>

            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
                  Welcome to TABOUT
                </h2>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full mb-4 backdrop-blur-sm border border-pink-500/30">
                  <Shield size={32} className="text-pink-400" />
                </div>

                <h2 className="text-xl mt-3 font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
                  Get Started
                </h2>
                <p className="text-gray-300 text-sm">
                  Set a password to unblock your sites later.
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-600/50 bg-gray-800/60 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                  />

                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    <Eye size={18} />
                  </button>
                </div>
                {errorMsgPassword && <p className=" p-4 bg-gradient-to-r text-xsm from-red-500/15 to-orange-500/15 border border-red-500/30 rounded-lg backdrop-blur-sm relative overflow-hidden ">{errorMsgPassword}</p>}

              </div>

              {/* Security Notice */}
              <div className="mt-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-200 text-xs">
                  <span className="font-semibold">⚠️ Why Set a password?:</span> You’ll need a password if you wish to bypass the block before the timer expires.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-3">

                <button onClick={handleSetPassword} className="cursor-pointer flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-pink-500/25 transition-all duration-200">
                  Set Password
                </button>
              </div>
            </div>

            {/* Bottom accent line */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500"></div> */}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-500 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
            TABOUT
          </h1>
          <p className="text-gray-300 text-sm mt-2 font-medium">
            Block Websites during your Productive Hours
          </p>
        </div>

        {/* Add Site Section */}
        <div className="mb-6">
          <div className="relative">
            <input
              value={inputSite}
              onChange={(e) => setInputSite(e.target.value)}
              placeholder="Enter site to block (e.g. youtube.com)"
              className="w-full p-3 rounded-lg border border-gray-600/50 bg-gray-800/60 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
            />
            <div className="flex gap-2 mt-2">
              <h2 className="text-white text-sm mt-6 ml-2 mr-2">Set block duration:</h2>
              {/* Hours input with spinner */}
              <div className="flex flex-col">
                <label className="text-sm text-white mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={inputHours}
                  onChange={(e) => setInputHours(e.target.value)}
                  className="w-18 p-2 font-bold focus:outline-none rounded-md border border-gray-600 bg-gray-800 text-white text-center"
                />
              </div>

              {/* Minutes input with spinner */}
              <div className="flex flex-col">
                <label className="text-sm text-white mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  className="w-18 p-2 font-bold focus:outline-none rounded-md border border-gray-600 bg-gray-800 text-white text-center"
                />
              </div>
            </div>
            {errorMsg && <p className="mb-3 mt-3 p-4 bg-gradient-to-r text-xsm from-red-500/15 to-orange-500/15 border border-red-500/30 rounded-lg backdrop-blur-sm relative overflow-hidden ">{errorMsg}</p>}

          </div>
          <button onClick={handleAddSite} className="cursor-pointer mt-3 w-full p-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-pink-500/25 transition-all duration-200 flex items-center justify-center gap-2 group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            Add to Blocklist
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-lg backdrop-blur-sm border border-gray-600/30">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-pink-400" />
            <span className="text-gray-300 text-sm">Currently Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-pink-400 font-bold text-lg">{blockedSites.length}</span>
            <Clock size={16} className="text-gray-400" />
          </div>
        </div>

        {/* Blocked Sites List */}
        <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
          {blockedSites.length === 0 ? (<p className="text-gray-50 text-sm">No sites blocked yet.</p>) : (
            blockedSites.map((site, index) => (
              <div key={site} className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-3 rounded-lg border border-gray-600/30 flex justify-between items-center group hover:from-gray-700/60 hover:to-gray-600/60 transition-all duration-200">
                <div className="flex items-center gap-3 relative w-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>

                  {/* Truncated site name */}
                  <span className="text-white font-medium overflow-hidden text-ellipsis whitespace-nowrap w-[40%]">
                    {site.site}
                  </span>

                  {/* Timer aligned to right */}
                  <p className="text-sm text-gray-300 font-bold ml-10">
                    {remainingTimes[site.site]}
                  </p>
                  <button onClick={() => handleDeleteSite(site.site)} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-lg p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100">
                  <X size={14} />
                </button>
                </div>

                
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-pink-500/10 to-transparent pointer-events-none"></div>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Modal Container */}
          <div className="w-[420px] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-600/30 shadow-2xl relative overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>

            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-orange-500/10 pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Close button */}
              <button onClick={() => setShowDeleteModal(false)} className="absolute top-8 right-4 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full mb-4 backdrop-blur-sm border border-orange-500/30">
                  <AlertTriangle size={32} className="text-orange-400" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent mb-2">
                  Unblock Website
                </h2>
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600/30">
                  <p className="text-pink-400 font-medium text-sm">{siteToDelete}</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5">
                {/* Reason Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    I want to unblock this site because:
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Enter your reason (e.g., needed for work, research, etc.)"
                    rows="3"
                    className="w-full p-3 rounded-lg border border-gray-600/50 bg-gray-800/60 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password:
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter your password to confirm"
                      className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-600/50 bg-gray-800/60 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
                {errorMsgDelete && <p className="mb-6 p-4 bg-gradient-to-r text-xsm from-red-500/15 to-orange-500/15 border border-red-500/30 rounded-lg backdrop-blur-sm relative overflow-hidden ">{errorMsgDelete}</p>}
              </div>



              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 px-4 rounded-lg border border-gray-600/50 bg-gray-800/40 text-gray-300 hover:bg-gray-700/40 hover:text-white transition-all duration-200">
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium shadow-lg hover:shadow-orange-500/25 transition-all duration-200">
                  Unblock Site
                </button>
              </div>
            </div>

            {/* Bottom accent line */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-600 to-orange-500"></div> */}
          </div>
        </div>
      )}
    </div>
  );
}





