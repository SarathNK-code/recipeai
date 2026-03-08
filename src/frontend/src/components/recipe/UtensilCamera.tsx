import { useCamera } from "@/camera/useCamera";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type UtensilAnalysisResult,
  analyzeUtensilPhoto,
  hasApiKey,
} from "@/utils/openai";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  FlipHorizontal,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

interface UtensilCameraProps {
  onConfirmUtensil: (utensil: {
    name: string;
    type: string;
    size: string;
  }) => void;
}

type Step = "capture" | "preview" | "analyzing" | "result";

export function UtensilCamera({ onConfirmUtensil }: UtensilCameraProps) {
  const [step, setStep] = useState<Step>("capture");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<UtensilAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", quality: 0.9 });

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setCapturedFile(file);
    setPreviewUrl(url);
    setStep("preview");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleCameraCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      await stopCamera();
      setCameraMode(false);
      handleFileSelect(file);
    }
  };

  const handleStartCamera = async () => {
    setCameraMode(true);
    setStep("capture");
    await startCamera();
  };

  const handleStopCamera = async () => {
    await stopCamera();
    setCameraMode(false);
  };

  const handleAnalyze = async () => {
    if (!capturedFile) return;
    setStep("analyzing");
    setAnalysisError(null);
    try {
      const result = await analyzeUtensilPhoto(capturedFile);
      setAnalysisResult(result);
      setStep("result");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setAnalysisError(message);
      setStep("preview");
    }
  };

  const handleConfirm = () => {
    if (!analysisResult) return;
    onConfirmUtensil({
      name: analysisResult.name,
      type: analysisResult.type,
      size: analysisResult.size,
    });
    handleReset();
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setCameraMode(false);
    setStep("capture");
  };

  const confidenceColor = {
    high: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-red-100 text-red-800 border-red-200",
  };

  if (!hasApiKey()) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertCircle className="w-4 h-4 inline mr-2" />
        AI photo analysis requires an OpenAI API key. Add{" "}
        <code className="font-mono bg-amber-100 px-1 rounded">
          VITE_OPENAI_API_KEY
        </code>{" "}
        to your environment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step: Capture */}
      {step === "capture" && !cameraMode && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {isSupported !== false && (
              <Button
                variant="outline"
                onClick={handleStartCamera}
                disabled={cameraLoading}
                className="h-20 flex-col gap-2 border-2 border-dashed border-border hover:border-accent hover:bg-accent/5"
              >
                <Camera className="w-6 h-6 text-accent" />
                <span className="text-xs">Use Camera</span>
              </Button>
            )}
            <Button
              data-ocid="utensils.photo.upload_button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "h-20 flex-col gap-2 border-2 border-dashed border-border hover:border-accent hover:bg-accent/5",
                isSupported === false && "col-span-2",
              )}
            >
              <Upload className="w-6 h-6 text-accent" />
              <span className="text-xs">Upload Photo</span>
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <p className="text-xs text-muted-foreground text-center">
            Take or upload a photo of any kitchen utensil for AI size analysis
          </p>
        </div>
      )}

      {/* Camera active */}
      {cameraMode && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              data-ocid="utensils.photo.canvas_target"
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
              style={{ minHeight: "16rem" }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {cameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                <div className="text-center text-white">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{cameraError.message}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCameraCapture}
              disabled={!isActive || cameraLoading}
              className="flex-1 bg-primary text-primary-foreground"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture Photo
            </Button>
            <Button variant="outline" onClick={handleStopCamera} size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && previewUrl && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={previewUrl}
              alt="Utensil preview"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {analysisError && (
            <div
              data-ocid="recipe.error_state"
              className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {analysisError}
            </div>
          )}

          <Button
            data-ocid="utensils.analyze_button"
            onClick={handleAnalyze}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <FlipHorizontal className="w-4 h-4 mr-2" />
            Analyze Utensil with AI
          </Button>
        </div>
      )}

      {/* Step: Analyzing */}
      {step === "analyzing" && (
        <div className="space-y-3">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Analyzing..."
              className="w-full h-48 object-cover rounded-xl opacity-50"
            />
          )}
          <div
            data-ocid="recipe.loading_state"
            className="flex items-center gap-3 bg-muted rounded-lg px-4 py-3"
          >
            <Loader2 className="w-5 h-5 animate-spin text-accent shrink-0" />
            <div>
              <p className="text-sm font-medium">Analyzing your utensil...</p>
              <p className="text-xs text-muted-foreground">
                AI is identifying size and type
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && analysisResult && (
        <div className="space-y-3">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Analyzed utensil"
              className="w-full h-48 object-cover rounded-xl"
            />
          )}

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-fraunces font-semibold text-lg">
                  {analysisResult.name}
                </h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {analysisResult.type}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-xs capitalize shrink-0",
                  confidenceColor[analysisResult.confidence],
                )}
              >
                {analysisResult.confidence} confidence
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                  Size
                </p>
                <p className="text-sm font-semibold">{analysisResult.size}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                  Type
                </p>
                <p className="text-sm font-semibold capitalize">
                  {analysisResult.type}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysisResult.description}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              data-ocid="utensils.confirm_button"
              onClick={handleConfirm}
              className="flex-1 bg-primary text-primary-foreground"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Add to My Utensils
            </Button>
            <Button variant="outline" onClick={handleReset} size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
