import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, SidebarTab } from './components/layout/Sidebar';
import { HomePage } from './components/home/HomePage';
import { DashboardView } from './components/dashboard/DashboardView';
import { Workspace } from './components/workspace/Workspace';
import { HistoryView } from './components/history/HistoryView';
import { ExamplePlayground } from './components/playground/ExamplePlayground';
import { SettingsModal } from './components/settings/SettingsModal';
import { ModelSpecModal } from './components/settings/ModelSpecModal';
import { DocsModal } from './components/docs/DocsModal';
import { ShortcutsModal } from './components/docs/ShortcutsModal';
import { MobileCameraCapture } from './components/upload/MobileCameraCapture';
import { Modal } from './components/ui/Modal';
import { ToastProvider, useToast } from './components/ui/Toast';
import {
  WorkspaceState,
  WorkspaceActions,
  InputMode,
  ProcessingStatus,
  TokenEdit,
} from './types/workspace';
import { PredictResponse, TokenMetadata } from './types/api';
import { HistoryEntry } from './types/history';
import { DemoPreset, DEMO_PRESETS } from './services/demoData';
import { checkApiHealth, predictEquation } from './services/api';
import { saveHistoryEntry, getHistory } from './services/historyStorage';
import { replaceTokenInSequence } from './utils/latex';

export const MainApp: React.FC = () => {
  const { success, error, info, warning } = useToast();

  // Navigation: check URL for view or default to 'home'
  const initialView = (new URLSearchParams(window.location.search).get('view') as SidebarTab) || 'home';
  const [currentTab, setCurrentTab] = useState<SidebarTab>(initialView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState('Untitled Equation Workspace');
  const [beamWidth, setBeamWidth] = useState(3);

  // Navigation with browser history pushState
  const navigateToTab = useCallback((tab: SidebarTab) => {
    if (tab === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    if (tab === 'model') {
      setIsModelSpecsOpen(true);
      return;
    }
    if (tab === 'docs') {
      setIsDocsOpen(true);
      return;
    }
    setCurrentTab(tab);
    const targetUrl = tab === 'home' ? '/' : `/?view=${tab}`;
    window.history.pushState({ tab }, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const tab =
        (e.state?.tab as SidebarTab) ||
        (new URLSearchParams(window.location.search).get('view') as SidebarTab) ||
        'home';
      setCurrentTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modals visibility
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isModelSpecsOpen, setIsModelSpecsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Backend connection status
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // History counts for sidebar badges
  const [historyCount, setHistoryCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Core Workspace state
  const [inputMode, setInputMode] = useState<InputMode>('canvas');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [currentStepMessage, setCurrentStepMessage] = useState('');
  const [prediction, setPredictionState] = useState<PredictResponse | null>(null);
  const [editedLatex, setEditedLatex] = useState<string>('');
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);
  const [tokenEdits, setTokenEdits] = useState<TokenEdit[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(null);

  // Explainability visual settings
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [showSpotlight, setShowSpotlight] = useState<boolean>(true);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [spotlightRadius, setSpotlightRadius] = useState<number>(24);

  // Update history count badge
  const updateCounts = useCallback(() => {
    const list = getHistory();
    setHistoryCount(list.length);
    setFavoritesCount(list.filter((x) => x.isFavorite).length);
  }, []);

  // Check backend health on mount
  const refreshBackendConnection = useCallback(async () => {
    const res = await checkApiHealth();
    setIsBackendConnected(res.ok);
    return res.ok;
  }, []);

  useEffect(() => {
    refreshBackendConnection();
    updateCounts();
  }, [refreshBackendConnection, updateCounts]);

  // Set prediction result and automatically select first token
  const handleSetPrediction = useCallback(
    (result: PredictResponse, imagePreview: string) => {
      setPredictionState(result);
      setEditedLatex(result.latex);
      setInputImagePreview(imagePreview);
      setTokenEdits([]);
      setActiveTokenIndex(result.tokens && result.tokens.length > 0 ? 0 : null);
      setProcessingStatus('success');
      setCurrentStepMessage('Recognition and verification complete');

      // Auto-save entry to local history
      saveHistoryEntry({
        inputMode,
        inputPreview: imagePreview,
        originalLatex: result.latex,
        currentLatex: result.latex,
        tokens: result.tokens,
        avgConfidence: result.avg_confidence,
        latencyMs: result.latency_ms,
        syntaxValid: result.syntax_valid,
        sympy: result.sympy,
        preprocessedImage: result.preprocessed_image,
      });
      updateCounts();
    },
    [inputMode, updateCounts]
  );

  // Replace a token at index with a new token from alternatives or custom input
  const handleReplaceToken = useCallback(
    (index: number, newToken: string) => {
      if (!prediction || index < 0 || index >= prediction.tokens.length) return;

      const oldToken = prediction.tokens[index].token;
      const currentTokenList = prediction.tokens.map((t) => t.token);

      const updatedTokensList = [...currentTokenList];
      updatedTokensList[index] = newToken;

      const newLatex = replaceTokenInSequence(currentTokenList, index, newToken);
      setEditedLatex(newLatex);

      setTokenEdits((prev) => [
        ...prev.filter((e) => e.index !== index),
        { index, originalToken: oldToken, newToken, timestamp: Date.now() },
      ]);

      const updatedTokensMeta: TokenMetadata[] = prediction.tokens.map((t, i) =>
        i === index ? { ...t, token: newToken } : t
      );

      setPredictionState({
        ...prediction,
        tokens: updatedTokensMeta,
      });

      success('Symbol Corrected', `Replaced ${oldToken} with ${newToken}`);
    },
    [prediction, success]
  );

  // Reset edited equation to original AI prediction
  const handleResetToOriginal = useCallback(() => {
    if (!prediction) return;
    setEditedLatex(prediction.latex);
    setTokenEdits([]);
    info('Reset to Original', 'Restored initial AI recognition sequence.');
  }, [prediction, info]);

  // Reset entire workspace
  const handleClearWorkspace = useCallback(() => {
    setPredictionState(null);
    setEditedLatex('');
    setActiveTokenIndex(null);
    setTokenEdits([]);
    setErrorMessage(null);
    setInputImagePreview(null);
    setProcessingStatus('idle');
    setCurrentStepMessage('');
    info('Workspace Reset', 'Ready for new mathematical input.');
  }, [info]);

  // Run recognition pipeline on input Blob/File
  const handleRecognize = async (fileOrBlob: Blob | File, previewUrl: string) => {
    setInputImagePreview(previewUrl);
    setProcessingStatus('preparing');
    setCurrentStepMessage('Preparing high-contrast input image...');
    setErrorMessage(null);

    const isAlive = await refreshBackendConnection();

    if (isAlive) {
      try {
        setProcessingStatus('preprocessing');
        setCurrentStepMessage('Morphological background division & binarization...');

        const result = await predictEquation({
          file: fileOrBlob,
          mode: inputMode,
          beam_width: beamWidth,
        });

        handleSetPrediction(result, previewUrl);
        success('Recognition Complete', `Decoded ${result.tokens.length} symbols in ${result.latency_ms} ms`);
      } catch (err: unknown) {
        setProcessingStatus('error');
        const msg = err instanceof Error ? err.message : 'Recognition failed';
        setErrorMessage(msg);
        error('Recognition Error', msg);
      }
    } else {
      setProcessingStatus('preprocessing');
      setCurrentStepMessage('Backend offline: Running interactive simulation mode...');

      setTimeout(() => {
        setProcessingStatus('decoding');
        setCurrentStepMessage('Transformer beam search (Simulation)...');

        setTimeout(() => {
          const demoPreset = DEMO_PRESETS[Math.floor(Math.random() * DEMO_PRESETS.length)];
          handleSetPrediction(
            {
              ...demoPreset.response,
              preprocessed_image: demoPreset.response.preprocessed_image || previewUrl,
            },
            previewUrl
          );
          warning(
            'Interactive Simulation Mode',
            'FastAPI backend is offline. Loaded authentic CROHME23 simulation data.'
          );
        }, 600);
      }, 500);
    }
  };

  // Load entry from History
  const handleLoadHistoryEntry = (entry: HistoryEntry) => {
    setInputMode(entry.inputMode);
    setInputImagePreview(entry.inputPreview);
    setPredictionState({
      latex: entry.originalLatex,
      tokens: entry.tokens,
      avg_confidence: entry.avgConfidence,
      syntax_valid: entry.syntaxValid,
      sympy: entry.sympy,
      preprocessed_image: entry.preprocessedImage || entry.inputPreview,
      latency_ms: entry.latencyMs,
    });
    setEditedLatex(entry.currentLatex);
    setActiveTokenIndex(entry.tokens && entry.tokens.length > 0 ? 0 : null);
    setTokenEdits([]);
    navigateToTab('workspace');
    success('Loaded History Entry', `Expression restored into workspace.`);
  };

  // Load preset from Playground or Homepage
  const handleLoadExample = (ex: DemoPreset) => {
    handleSetPrediction(ex.response, ex.response.preprocessed_image);
    navigateToTab('workspace');
    success('Example Loaded', `${ex.name} loaded into workspace.`);
  };

  // Keyboard shortcut listener: '?' to open shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const workspaceState: WorkspaceState = {
    inputMode,
    processingStatus,
    currentStepMessage,
    prediction,
    editedLatex,
    activeTokenIndex,
    tokenEdits,
    errorMessage,
    inputImagePreview,
    overlayOpacity,
    showSpotlight,
    showCrosshair,
    showCoordinates,
    spotlightRadius,
  };

  const workspaceActions: WorkspaceActions = {
    setInputMode,
    setProcessingStatus: (status, message = '') => {
      setProcessingStatus(status);
      setCurrentStepMessage(message);
    },
    setPrediction: handleSetPrediction,
    setEditedLatex,
    setActiveTokenIndex,
    replaceToken: handleReplaceToken,
    resetToOriginalPrediction: handleResetToOriginal,
    setErrorMessage,
    clearWorkspace: handleClearWorkspace,
    updateExplainabilityConfig: (config) => {
      if (config.overlayOpacity !== undefined) setOverlayOpacity(config.overlayOpacity);
      if (config.showSpotlight !== undefined) setShowSpotlight(config.showSpotlight);
      if (config.showCrosshair !== undefined) setShowCrosshair(config.showCrosshair);
      if (config.showCoordinates !== undefined) setShowCoordinates(config.showCoordinates);
      if (config.spotlightRadius !== undefined) setSpotlightRadius(config.spotlightRadius);
    },
  };

  if (currentTab === 'home') {
    return (
      <div className="min-h-screen w-full bg-[#090B10] text-[#F1F5F9] selection:bg-[#8B7CFF]/30 selection:text-white">
        <HomePage
          onLaunchWorkspace={() => navigateToTab('workspace')}
          onOpenDashboard={() => navigateToTab('dashboard')}
          onLoadPreset={handleLoadExample}
          isBackendConnected={isBackendConnected}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenDocs={() => setIsDocsOpen(true)}
          onOpenModelSpecs={() => setIsModelSpecsOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Settings & Backend Connection Modal */}
        <Modal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          title="Settings & Backend Connection"
          subtitle="Manage FastAPI inference endpoints and beam decoding width"
          maxWidth="md"
        >
          <SettingsModal
            beamWidth={beamWidth}
            onBeamWidthChange={setBeamWidth}
            isBackendConnected={isBackendConnected}
            onRefreshConnection={refreshBackendConnection}
          />
        </Modal>

        {/* Model Specifications & Benchmarks Modal */}
        <Modal
          isOpen={isModelSpecsOpen}
          onClose={() => setIsModelSpecsOpen(false)}
          title="Model Architecture & Benchmarks"
          subtitle="DenseNet-121 + 3-Layer Transformer (CROHME23 v3-Final)"
          maxWidth="2xl"
        >
          <ModelSpecModal />
        </Modal>

        {/* Documentation & Vocabulary Modal */}
        <Modal
          isOpen={isDocsOpen}
          onClose={() => setIsDocsOpen(false)}
          title="Documentation & Vocabulary"
          subtitle="Guidelines and searchable atomic token dictionary"
          maxWidth="2xl"
        >
          <DocsModal />
        </Modal>

        {/* Shortcuts Cheatsheet Modal */}
        <Modal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
          title="Keyboard Shortcuts"
          subtitle="Accelerate your mathematical workflow"
          maxWidth="md"
        >
          <ShortcutsModal />
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090B10] text-[#F1F5F9]">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={navigateToTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNewWorkspace={() => {
          handleClearWorkspace();
          navigateToTab('workspace');
        }}
        isBackendConnected={isBackendConnected}
        historyCount={historyCount}
        favoritesCount={favoritesCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Navigation */}
        <Header
          currentTab={currentTab}
          onSelectTab={navigateToTab}
          workspaceTitle={workspaceTitle}
          onUpdateTitle={setWorkspaceTitle}
          isBackendConnected={isBackendConnected}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenDocs={() => setIsDocsOpen(true)}
          onOpenModelSpecs={() => setIsModelSpecsOpen(true)}
          onResetWorkspace={handleClearWorkspace}
        />

        {/* View Switcher based on currentTab */}
        <main className="flex-1 overflow-hidden relative">
          {currentTab === 'dashboard' && (
            <DashboardView
              onStartCanvas={() => {
                setInputMode('canvas');
                navigateToTab('workspace');
              }}
              onStartPhoto={() => {
                setInputMode('photo');
                navigateToTab('workspace');
              }}
              onOpenQrModal={() => {
                setInputMode('photo');
                navigateToTab('workspace');
              }}
              onOpenPlayground={() => navigateToTab('playground')}
              onOpenHistory={() => navigateToTab('history')}
              onOpenModelSpecs={() => setIsModelSpecsOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onLoadHistoryEntry={handleLoadHistoryEntry}
              isBackendConnected={isBackendConnected}
            />
          )}

          {currentTab === 'workspace' && (
            <Workspace
              workspace={workspaceState}
              actions={workspaceActions}
              onRecognize={handleRecognize}
              isRecognizing={
                processingStatus === 'preparing' ||
                processingStatus === 'preprocessing' ||
                processingStatus === 'decoding' ||
                processingStatus === 'verifying'
              }
            />
          )}

          {currentTab === 'history' && (
            <div className="h-full p-4 sm:p-6 overflow-hidden color-grade-bg">
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                <h2 className="text-lg font-semibold text-[#F1F5F9] mb-3">
                  Recognition History
                </h2>
                <div className="flex-1 min-h-0 bg-[#10141D]/90 backdrop-blur-md p-4 rounded-2xl border border-[#252D3B]">
                  <HistoryView
                    initialFilter="all"
                    onLoadEntry={handleLoadHistoryEntry}
                    onClose={() => navigateToTab('workspace')}
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'favorites' && (
            <div className="h-full p-4 sm:p-6 overflow-hidden color-grade-bg">
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                <h2 className="text-lg font-semibold text-[#F1F5F9] mb-3">
                  My Favorite Equations
                </h2>
                <div className="flex-1 min-h-0 bg-[#10141D]/90 backdrop-blur-md p-4 rounded-2xl border border-[#252D3B]">
                  <HistoryView
                    initialFilter="favorites"
                    onLoadEntry={handleLoadHistoryEntry}
                    onClose={() => navigateToTab('workspace')}
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'playground' && (
            <div className="h-full p-4 sm:p-6 overflow-hidden color-grade-bg">
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                <h2 className="text-lg font-semibold text-[#F1F5F9] mb-3">
                  Mathematical Example Playground
                </h2>
                <div className="flex-1 min-h-0 bg-[#10141D]/90 backdrop-blur-md p-4 rounded-2xl border border-[#252D3B]">
                  <ExamplePlayground
                    onLoadExample={handleLoadExample}
                    onClose={() => navigateToTab('workspace')}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Settings & Backend Connection Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings & Backend Connection"
        subtitle="Manage FastAPI inference endpoints and beam decoding width"
        maxWidth="md"
      >
        <SettingsModal
          beamWidth={beamWidth}
          onBeamWidthChange={setBeamWidth}
          isBackendConnected={isBackendConnected}
          onRefreshConnection={refreshBackendConnection}
        />
      </Modal>

      {/* Model Specifications & Benchmarks Modal */}
      <Modal
        isOpen={isModelSpecsOpen}
        onClose={() => setIsModelSpecsOpen(false)}
        title="Model Architecture & Benchmarks"
        subtitle="DenseNet-121 + 3-Layer Transformer (CROHME23 v3-Final)"
        maxWidth="2xl"
      >
        <ModelSpecModal />
      </Modal>

      {/* Documentation & Vocabulary Modal */}
      <Modal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        title="Documentation & Vocabulary"
        subtitle="Guidelines and searchable atomic token dictionary"
        maxWidth="2xl"
      >
        <DocsModal />
      </Modal>

      {/* Shortcuts Cheatsheet Modal */}
      <Modal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        title="Keyboard Shortcuts"
        subtitle="Accelerate your mathematical workflow"
        maxWidth="md"
      >
        <ShortcutsModal />
      </Modal>
    </div>
  );
};

export const App: React.FC = () => {
  // Check if opened via QR code for mobile camera capture
  const searchParams = new URLSearchParams(window.location.search);
  const isCapture = searchParams.get('mode') === 'capture';
  const sessionId = searchParams.get('session');

  if (isCapture && sessionId) {
    return <MobileCameraCapture sessionId={sessionId} />;
  }

  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
};
