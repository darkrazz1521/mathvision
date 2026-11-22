import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import {
  Smartphone,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink,
  Edit2,
  Copy,
  Check,
  AlertTriangle,
  Wifi,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import {
  createMobileSession,
  checkMobileSessionStatus,
  getNetworkInfo,
  getApiBaseUrl,
} from '../../services/api';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoReceived: (dataUrl: string, filename: string) => void;
}

export const MobileQrModal: React.FC<MobileQrModalProps> = ({
  isOpen,
  onClose,
  onPhotoReceived,
}) => {
  const { success, error } = useToast();
  const [sessionId, setSessionId] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [lanHost, setLanHost] = useState<string>('');
  const [availableIps, setAvailableIps] = useState<string[]>([]);
  const [isEditingHost, setIsEditingHost] = useState(false);
  const [hostInput, setHostInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(true);
  const [hasReceived, setHasReceived] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const apiBase = getApiBaseUrl();
  const isCloudBackend = !apiBase.includes('localhost') && !apiBase.includes('127.0.0.1');

  // Generate QR for a given host and session
  const generateQrForHost = async (host: string, sessId: string) => {
    let url = '';
    if (isCloudBackend && (!host || host === 'cloud')) {
      url = `${apiBase.replace(/\/$/, '')}/capture?session=${sessId}`;
    } else if (host.startsWith('http://') || host.startsWith('https://')) {
      url = `${host.replace(/\/$/, '')}/capture?session=${sessId}`;
    } else {
      const port = window.location.port ? `:${window.location.port}` : '';
      const protocol = window.location.protocol;
      url = `${protocol}//${host}${port}/?mode=capture&session=${sessId}&api=${encodeURIComponent(apiBase)}`;
    }
    setTargetUrl(url);

    try {
      const qrData = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#05070B',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(qrData);
    } catch (e) {
      console.error('Failed to encode QR:', e);
    }
  };

  // Initialize session and discover real Wi-Fi IP or cloud endpoint
  const initSession = async () => {
    setIsWaiting(true);
    setHasReceived(false);

    try {
      // 1. Create mobile session
      const sess = await createMobileSession();
      setSessionId(sess.session_id);

      if (isCloudBackend) {
        setLanHost('cloud');
        setHostInput(apiBase);
        await generateQrForHost('cloud', sess.session_id);
      } else {
        // 2. Discover LAN IPs from backend
        const net = await getNetworkInfo();
        const detectedIps = net?.available_ips || (net?.lan_ip ? [net.lan_ip] : []);
        setAvailableIps(detectedIps);

        // 3. Choose the best IP for phone connection
        let bestHost = window.location.hostname;

        if (bestHost === 'localhost' || bestHost === '127.0.0.1') {
          if (net?.lan_ip && !net.lan_ip.startsWith('127.')) {
            bestHost = net.lan_ip;
          } else if (detectedIps.length > 0) {
            const nonVirtual = detectedIps.find(
              (ip) => !ip.startsWith('192.168.183.') && !ip.startsWith('192.168.250.') && !ip.startsWith('172.22.')
            );
            bestHost = nonVirtual || detectedIps[0];
          } else {
            bestHost = '10.146.164.145'; // Wi-Fi fallback from system adapter
          }
        }

        setLanHost(bestHost);
        setHostInput(bestHost);
        await generateQrForHost(bestHost, sess.session_id);
      }
    } catch (err) {
      console.error('Failed to initialize mobile session:', err);
      const fallbackSess = Math.random().toString(36).substring(2, 9);
      setSessionId(fallbackSess);
      if (isCloudBackend) {
        setLanHost('cloud');
        await generateQrForHost('cloud', fallbackSess);
      } else {
        setLanHost('10.146.164.145');
        setHostInput('10.146.164.145');
        await generateQrForHost('10.146.164.145', fallbackSess);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      initSession();
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen]);

  // Poll for phone photo upload with concurrency protection
  useEffect(() => {
    if (!isOpen || !sessionId || hasReceived) return;

    let isPolling = false;

    pollIntervalRef.current = setInterval(async () => {
      if (isPolling) return;
      isPolling = true;

      try {
        const status = await checkMobileSessionStatus(sessionId, apiBase);
        if (status.has_image && status.image_b64) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setHasReceived(true);
          setIsWaiting(false);
          success('Photo Received!', 'Handwritten mathematics uploaded from phone camera.');
          setTimeout(() => {
            onPhotoReceived(status.image_b64!, status.filename || 'phone_photo.jpg');
            onClose();
          }, 600);
        }
      } catch (e) {
        console.error('Poll error:', e);
      } finally {
        isPolling = false;
      }
    }, 1200);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, sessionId, hasReceived, onPhotoReceived, onClose, success, apiBase]);

  // Handle selecting an IP from detected options
  const handleSelectIp = (ip: string) => {
    setLanHost(ip);
    setHostInput(ip);
    generateQrForHost(ip, sessionId);
  };

  const handleSaveCustomHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostInput.trim()) {
      const clean = hostInput.trim();
      setLanHost(clean);
      generateQrForHost(clean, sessionId);
      setIsEditingHost(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isLocalhost = lanHost === 'localhost' || lanHost === '127.0.0.1';

  if (!isOpen) return null;

  return (
    <div className="flex flex-col items-center text-center p-2 text-[#F1F5F9]">
      {/* Header Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-xl bg-[#8B7CFF]/15 text-[#8B7CFF]">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h3 className="text-sm font-semibold text-[#F1F5F9]">
            Scan with Phone Camera
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Snap a photo of your handwritten notebook equation
          </p>
        </div>
      </div>

      {/* Status banner: Cloud Sync vs Localhost Warning */}
      {isCloudBackend ? (
        <div className="w-full max-w-sm p-2.5 my-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-left flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="leading-snug">
              <span className="font-semibold text-emerald-200">Universal Cloud Sync Active</span>
              <p className="text-[11px] text-emerald-300/80">
                Works on any phone via 4G, 5G, or Wi-Fi
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
            HTTPS Live
          </span>
        </div>
      ) : (
        <>
          {isLocalhost && (
            <div className="w-full max-w-sm p-3 my-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong>Phone cannot open "localhost":</strong> Select your computer's Wi-Fi IP below so your phone can reach this computer.
              </div>
            </div>
          )}

          {/* Available IP Selection Pills */}
          <div className="w-full max-w-sm my-2 text-left">
            <span className="text-[11px] text-[#94A3B8] font-medium block mb-1.5">
              Select Computer IP on Wi-Fi Network:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableIps.map((ip) => {
                const isSelected = lanHost === ip;
                const isWifi = ip.startsWith('10.') || ip.startsWith('192.168.1.') || ip.startsWith('192.168.0.');
                return (
                  <button
                    key={ip}
                    onClick={() => handleSelectIp(ip)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-mono rounded-lg transition-colors border select-none flex items-center gap-1',
                      isSelected
                        ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF] font-semibold shadow-sm'
                        : 'bg-[#090B10] text-[#94A3B8] border-[#252D3B] hover:text-[#F1F5F9]'
                    )}
                  >
                    <span>{ip}</span>
                    {isWifi && <span className="text-[9px] text-[#34D399] font-sans font-bold">Wi-Fi ★</span>}
                  </button>
                );
              })}

              <button
                onClick={() => setIsEditingHost(!isEditingHost)}
                className="px-2 py-1 text-xs rounded-lg text-[#38BDF8] border border-[#252D3B] hover:bg-[#151B27]"
              >
                Custom IP...
              </button>
            </div>

            {isEditingHost && (
              <form onSubmit={handleSaveCustomHost} className="flex gap-1.5 mt-2">
                <input
                  type="text"
                  value={hostInput}
                  onChange={(e) => setHostInput(e.target.value)}
                  placeholder="e.g. 10.146.164.145"
                  className="flex-1 bg-[#090B10] border border-[#8B7CFF] rounded-lg px-2.5 py-1 text-xs text-[#F1F5F9] font-mono focus:outline-none"
                />
                <Button size="xs" variant="primary" type="submit">
                  Apply
                </Button>
              </form>
            )}
          </div>
        </>
      )}

      {/* QR Code Container with Animated Scanner */}
      <div className="relative my-3 p-4 rounded-2xl bg-white shadow-2xl border-2 border-[#8B7CFF]/40 overflow-hidden">
        {qrDataUrl ? (
          <div className="relative">
            <img
              src={qrDataUrl}
              alt="Scan QR code with phone"
              className="w-56 h-56 block rounded-lg select-none"
            />
            {/* Animated Laser Scanning Line */}
            {isWaiting && !hasReceived && (
              <motion.div
                animate={{ y: [0, 220, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8B7CFF] to-transparent shadow-[0_0_12px_2px_#8B7CFF] pointer-events-none"
              />
            )}
          </div>
        ) : (
          <div className="w-56 h-56 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B7CFF]" />
            <span className="text-xs mt-2 font-mono">Generating QR...</span>
          </div>
        )}

        {/* Success Overlay once phone sends image */}
        {hasReceived && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/40">
              <CheckCircle2 className="w-7 h-7 animate-bounce" />
            </div>
            <span className="text-sm font-bold text-white">Photo Transferred!</span>
            <span className="text-xs text-gray-300 mt-1">Starting recognition...</span>
          </motion.div>
        )}
      </div>

      {/* Target URL with Copy & Test Link */}
      <div className="w-full max-w-sm flex items-center justify-between p-2 rounded-xl bg-[#090B10] border border-[#252D3B] text-xs">
        <code className="text-[11px] font-mono text-[#38BDF8] truncate max-w-[210px]">
          {targetUrl}
        </code>
        <div className="flex items-center gap-1">
          <Tooltip content={isCopied ? 'Copied!' : 'Copy Mobile Link'}>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white transition-colors"
              aria-label="Copy Link"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </Tooltip>
          <Tooltip content="Open in new browser tab to test locally">
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white transition-colors"
              aria-label="Open Link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Tooltip>
        </div>
      </div>

      {/* Important Connection Instructions */}
      <div className="w-full max-w-sm mt-3 p-3 rounded-xl bg-[#151B27] border border-[#252D3B] text-left text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          {isCloudBackend ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <Wifi className="w-3.5 h-3.5" />
          )}
          <span>
            {isCloudBackend
              ? 'Instant Camera Sync Instructions:'
              : 'Wi-Fi Connection Requirement:'}
          </span>
        </div>
        {isCloudBackend ? (
          <>
            <p className="text-[11px] text-[#94A3B8] leading-snug">
              1. Scan the QR code using any smartphone Camera app or Google Lens.
            </p>
            <p className="text-[11px] text-[#94A3B8] leading-snug">
              2. Take a photo of your notebook equation and tap <strong>Send to MathVision Desktop</strong>.
            </p>
          </>
        ) : (
          <>
            <p className="text-[11px] text-[#94A3B8] leading-snug">
              1. Your <strong>phone and computer must be on the same Wi-Fi network</strong> (or connect your computer to your phone's Mobile Hotspot).
            </p>
            <p className="text-[11px] text-[#94A3B8] leading-snug">
              2. If your phone is using mobile data (4G/5G), turn on Wi-Fi and connect to the same network.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
