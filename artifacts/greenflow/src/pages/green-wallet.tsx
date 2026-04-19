import { useState } from "react";
import { useListWalletUsers, useCreateWalletUser, useListTransactions, useAddGreenCredits } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ShieldCheck, History, UserPlus } from "lucide-react";

type PreferredMode = "virtual_taxi" | "gautrain" | "metrobus" | "mixed";

export default function GreenWallet() {
  const { data: users, isLoading: isLoadingUsers } = useListWalletUsers();
  const { data: transactions, isLoading: isLoadingTx } = useListTransactions();
  const createUser = useCreateWalletUser();
  const addCredits = useAddGreenCredits();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- STATE INITIALIZATION ---
  const [displayName, setDisplayName] = useState("");
  const [preferredMode, setPreferredMode] = useState<PreferredMode>("mixed");
  const [consentGiven, setConsentGiven] = useState(false);

  // --- SAFE DATA HANDLING ---
  // Ensuring we always have arrays before calling .map()
  const usersList = Array.isArray(users) ? users : [];
  const txList = Array.isArray(transactions) ? transactions : [];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      toast({ 
        title: "Consent required", 
        description: "POPIA consent is required to register.", 
        variant: "destructive" 
      });
      return;
    }
    createUser.mutate({
      data: { displayName, preferredMode, consentGiven }
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Wallet user created successfully." });
        setDisplayName("");
        setConsentGiven(false);
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/users"] });
      }
    });
  };

  const handleAddDemoCredits = (userId: string) => {
    addCredits.mutate({
      userId,
      data: { 
        credits: 50, 
        reason: "Green Commute Bonus", 
        tripDistanceKm: 10, 
        mode: "virtual_taxi" 
      }
    }, {
      onSuccess: () => {
        toast({ title: "Credits Awarded", description: "50 Green Credits added to wallet." });
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/users"] });
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Green Wallet Registry</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" /> POPIA-Compliant Rewards Ledger
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          {/* REGISTRATION CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Register New Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="e.g. JoburgCommuter_01"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Mode</Label>
                  <Select value={preferredMode} onValueChange={(val: PreferredMode) => setPreferredMode(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed Modes</SelectItem>
                      <SelectItem value="gautrain">Gautrain Primary</SelectItem>
                      <SelectItem value="virtual_taxi">Virtual Taxi Primary</SelectItem>
                      <SelectItem value="metrobus">Metrobus Primary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm">POPIA Consent</Label>
                    <p className="text-xs text-muted-foreground">Allow data processing for rewards</p>
                  </div>
                  <Switch checked={consentGiven} onCheckedChange={setConsentGiven} />
                </div>
                <Button type="submit" className="w-full" disabled={createUser.isPending}>
                  {createUser.isPending ? "Registering..." : "Create Wallet"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* TRANSACTION HISTORY CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {isLoadingTx ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Loading...</div>
                ) : txList.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">No transactions yet.</div>
                ) : (
                  txList.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{tx.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate w-32">{tx.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">+{tx.credits}</span>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WALLET DIRECTORY TABLE */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Active Wallets Directory
            </CardTitle>
            <CardDescription>Anonymized view of platform participants</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="text-center py-10">Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Masked ID</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>CO₂ Saved</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.displayName}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{user.maskedId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {user.greenCredits} GC
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {(user.totalCo2SavedKg ?? 0).toLocaleString()} kg
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAddDemoCredits(user.id)}
                          disabled={addCredits.isPending}
                        >
                          Award 50 GC
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}