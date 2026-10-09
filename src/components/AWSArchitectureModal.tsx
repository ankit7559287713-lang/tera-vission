import React from 'react';
import {
  Server,
  Cloud,
  Database,
  Shield,
  Layers,
  X,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Globe
} from 'lucide-react';

interface AWSArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AWSArchitectureModal: React.FC<AWSArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AWS Cloud Architecture</h3>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                  AWS Bharat Builds Tour
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production-ready deployment specification for EARTHSIM: City Futures Lab
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Architecture Flow */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="text-[11px] text-amber-400 uppercase font-bold tracking-wider mb-2">
            Architecture Topology
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
              <Globe className="w-5 h-5 text-sky-400 mx-auto mb-1" />
              <div className="font-bold text-white">CloudFront + S3</div>
              <div className="text-[10px] text-slate-400">Vite SPA Static Assets</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
              <Cloud className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="font-bold text-white">AWS App Runner / ECS</div>
              <div className="text-[10px] text-slate-400">FastAPI / Node Engine</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
              <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="font-bold text-white">Amazon RDS</div>
              <div className="text-[10px] text-slate-400">PostgreSQL + PostGIS</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="font-bold text-white">Secrets Manager</div>
              <div className="text-[10px] text-slate-400">GEMINI_API_KEY Vault</div>
            </div>
          </div>
        </div>

        {/* AWS Services Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              1. Compute: AWS App Runner / ECS Fargate
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Fully managed container execution with auto-scaling down to zero when idle, handling deterministic simulation runs and API routing without infrastructure maintenance.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              2. Storage: Amazon S3 &amp; CloudFront CDN
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              High-throughput edge caching for interactive vector map tiles, GeoJSON municipal boundaries, and pre-rendered satellite raster composites.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              3. Persistence: Amazon RDS (PostgreSQL/PostGIS)
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Spatial database indexing for municipal wards, elevation contours, hydrological drain networks, and persistent multi-user saved simulation scenarios.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              4. Monitoring: Amazon CloudWatch &amp; X-Ray
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Real-time telemetry tracking simulation computation latencies, API request volumes, and automated anomaly alarms for high-load climate stress tests.
            </p>
          </div>
        </div>

        {/* Containerization & Deployment Commands */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            Quick Container Deployment Commands
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 overflow-x-auto">
            <div className="text-slate-500"># 1. Build Production Container</div>
            <div>docker build -t earthsim-city-futures:latest .</div>
            <div className="text-slate-500 pt-1"># 2. Run Container Locally on Port 3000</div>
            <div>docker run -d -p 3000:3000 -e NODE_ENV=production earthsim-city-futures:latest</div>
            <div className="text-slate-500 pt-1"># 3. Deploy to AWS App Runner / ECR</div>
            <div>aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com</div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Architecture Guide
          </button>
        </div>
      </div>
    </div>
  );
};
