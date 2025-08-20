"use client"

import { ProgressBar } from "./progress-bar"

export function ProgressBarTest() {
  return (
    <div className="space-y-6 p-6 glass-effect rounded-xl border-emerald-500/30">
      <h2 className="text-xl font-bold text-neutral/90">Progress Bar Test Cases</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral/80">Basic Test Cases</h3>
        <ProgressBar value={30} maxValue={200} label="Test 30/200 (15%)" color="amber" />
        <ProgressBar value={100} maxValue={200} label="Test 100/200 (50%)" color="amber" />
        <ProgressBar value={150} maxValue={200} label="Test 150/200 (75%)" color="amber" />
        <ProgressBar value={200} maxValue={200} label="Test 200/200 (100%)" color="amber" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral/80">Normal Cases</h3>
        <ProgressBar value={150} maxValue={200} label="Normal Progress" color="mint" />
        <ProgressBar value={50} maxValue={200} label="Low Progress" color="amber" />
        <ProgressBar value={200} maxValue={200} label="Full Progress" color="lavender" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral/80">Age Score Scenarios</h3>
        <ProgressBar value={180} maxValue={200} label="12 Month Wallet (180 points)" color="amber" />
        <ProgressBar value={250} maxValue={200} label="25 Month Wallet (250 points)" color="amber" />
        <ProgressBar value={348} maxValue={200} label="36 Month Wallet (348 points)" color="amber" />
        <ProgressBar value={500} maxValue={200} label="Very Old Wallet (500 points)" color="amber" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral/80">Edge Cases</h3>
        <ProgressBar value={0} maxValue={200} label="Zero Progress" color="mint" />
        <ProgressBar value={1} maxValue={200} label="Minimal Progress" color="amber" />
        <ProgressBar value={199} maxValue={200} label="Almost Full" color="lavender" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral/80">Debug Info</h3>
        <div className="text-sm text-neutral/70 space-y-1">
          <div>• Progress bars should show actual values even when exceeding max</div>
          <div>• Overflow values should display "MAX" badge</div>
          <div>• Progress bar should fill to 100% when value ≥ max</div>
          <div>• Text should not overflow container boundaries</div>
        </div>
      </div>
    </div>
  )
}
