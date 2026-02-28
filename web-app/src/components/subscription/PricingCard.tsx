"use client";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  currentTier?: boolean;
  onSelect?: () => void;
  buttonText?: string;
  disabled?: boolean;
}

export default function PricingCard({
  name,
  price,
  period,
  features,
  highlighted,
  currentTier,
  onSelect,
  buttonText = "Chọn gói",
  disabled,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-xl p-6 shadow ${
        highlighted
          ? "border-2 border-blue-500 bg-white ring-2 ring-blue-100"
          : "border bg-white"
      }`}
    >
      {highlighted && (
        <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
          Phổ biến nhất
        </span>
      )}
      <h3 className="text-lg font-bold text-gray-900">{name}</h3>
      <div className="mt-3">
        <span className="text-3xl font-bold text-gray-900">{price}</span>
        <span className="text-sm text-gray-500">/{period}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-green-500 mt-0.5">&#10003;</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={disabled || currentTier}
        className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium ${
          currentTier
            ? "bg-gray-100 text-gray-500 cursor-default"
            : highlighted
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        } disabled:opacity-50`}
      >
        {currentTier ? "Gói hiện tại" : buttonText}
      </button>
    </div>
  );
}
