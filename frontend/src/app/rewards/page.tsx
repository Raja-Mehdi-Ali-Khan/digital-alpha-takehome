"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { fetchRewards, redeemReward } from "@/lib/api";

type Reward = {
  id: number;
  name: string;
  description: string | null;
  cost_in_coins: number;
  is_active: boolean;
};

const REWARD_IMAGES = [
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
];

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redeem flow
  const [selected, setSelected] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRewards();
        setRewards(data);
      } catch {
        setError("Failed to load rewards");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openRedeem = (reward: Reward) => {
    setSelected(reward);
    setRedeemError(null);
    setSuccessMessage(null);
  };

  const closeModal = () => {
    if (redeeming) return;
    setSelected(null);
    setRedeemError(null);
    setSuccessMessage(null);
  };

  const handleConfirmRedeem = async () => {
    if (!selected) return;

    setRedeeming(true);
    setRedeemError(null);

    try {
      const result = await redeemReward(selected.id);

      // Tell the Header to refresh the balance
      window.dispatchEvent(new Event("balance-updated"));

      setSuccessMessage(result.message);
      setSelected(null);
    } catch (err: unknown) {
      setRedeemError(err instanceof Error ? err.message : "Redeem failed");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading rewards…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-danger)" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div style={{ marginBottom: "2rem" }}>
        <div className="page-kicker">Membership / Benefits</div>
        <h1 className="page-title">A little more from every payment.</h1>
        <p className="page-subtitle">
          Use your reward coins on practical perks, vouchers, and everyday savings.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.12)",
            border: "1px solid var(--color-success)",
            color: "var(--color-success)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            fontWeight: 500,
          }}
        >
          {successMessage}
        </div>
      )}

      <div
        className="rewards-grid"
      >
        {rewards.map((reward, index) => (
          <Card key={reward.id} className="reward-card">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "0.75rem" }}>
              <Image className="reward-image" src={REWARD_IMAGES[index % REWARD_IMAGES.length]} alt="" width={800} height={110} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{reward.name}</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", flex: 1 }}>
                {reward.description || "No description"}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                  {reward.cost_in_coins.toLocaleString()} coins
                </span>
                <Button size="sm" onClick={() => openRedeem(reward)}>
                  Redeem
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selected}
        onClose={closeModal}
        title="Confirm Redemption"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={redeeming}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRedeem} disabled={redeeming}>
              {redeeming ? "Redeeming…" : "Confirm"}
            </Button>
          </>
        }
      >
        {selected && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p>
              Redeem <strong>{selected.name}</strong> for{" "}
              <strong>{selected.cost_in_coins.toLocaleString()} coins</strong>?
            </p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              This action cannot be undone.
            </p>

            {redeemError && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid var(--color-danger)",
                  color: "var(--color-danger)",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.9rem",
                }}
              >
                {redeemError}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}