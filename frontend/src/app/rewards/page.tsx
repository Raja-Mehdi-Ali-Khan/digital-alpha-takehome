"use client";

import { useEffect, useState } from "react";
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

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redeem flow state
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

      // Notify the Header to refresh the balance
      window.dispatchEvent(new Event("balance-updated"));

      setSuccessMessage(result.message);
      setSelected(null);
    } catch (err: any) {
      setRedeemError(err.message || "Something went wrong");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading rewards…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-danger)" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Rewards Catalogue
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Redeem your coins for vouchers and perks
      </p>

      {successMessage && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid var(--color-success)",
            color: "var(--color-success)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
          }}
        >
          {successMessage}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "0.75rem" }}>
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
              You are about to redeem <strong>{selected.name}</strong> for{" "}
              <strong>{selected.cost_in_coins.toLocaleString()} coins</strong>.
            </p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              This action cannot be undone.
            </p>

            {redeemError && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
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