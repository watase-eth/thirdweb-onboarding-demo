import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ConnectButton, lightTheme, TransactionButton, useActiveAccount, useProfiles, useReadContract } from "thirdweb/react";
import { client } from "@/app/client";
import { inAppWallet } from "thirdweb/wallets";
import { useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { contractABI, contractAddress } from "@/app/contract";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Button } from "./ui/button";

export function InAppCard() {
    const account = useActiveAccount();

    const [isLoading, setIsLoading] = useState(false);

    const contract = getContract({
        client: client,
        chain: sepolia,
        address: contractAddress,
        abi: contractABI
    });

    const { data: count, isLoading: isCountLoading, refetch: refetchCount } = useReadContract({
        contract: contract,
        method: "getCount",
        params: []
    });

    const { data: userProfiles } = useProfiles({
        client: client,
    });
    console.log("Account", account);
    console.log("Profiles", userProfiles);

    const claimEngine = async () => {
        if(!account) return;

        setIsLoading(true);
        try {
            const resp = await fetch("/api/engine/increment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await resp.json();
            
            if (resp.ok) {
                console.log('Claim successful:', data);
                alert("Incremented");
            } else if (resp.status === 408) {
                console.log('Transaction not mined within timeout period:', data);
            } else {
                console.error('Claim failed:', data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            refetchCount();
        }
    };

    return (
        <>
            <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>In-App Wallet</CardTitle>
                <CardDescription>Create a new wallet directly within the app using auth methods like email, phone number, or social media.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-green-100 p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Why choose the traditional method:</h3>
                        <ul className="space-y-2 text-sm text-green-800">
                            <li className="flex items-start">
                                <span className="mr-2">✅</span>
                                <span>Easy onboarding for new users with familiar authentication methods</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✅</span>
                                <span>No need to install additional browser extensions or apps</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✅</span>
                                <span>Reduced friction for non-crypto native users</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-red-100 p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Pain Points:</h3>
                        <ul className="space-y-2 text-sm text-red-800">
                            <li className="flex items-start">
                                <span className="mr-2">❌</span>
                                <span>User still needs to funds their wallet with native tokens to pay for gas fees</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <ConnectButton 
                    client={client} 
                    theme={lightTheme()}
                    wallets={[
                        inAppWallet({
                            auth: {
                                options: [
                                    "x",
                                    "google",
                                    "coinbase",
                                    "farcaster",
                                    "email",
                                    "passkey",
                                    "guest",
                                ]
                            }
                        })
                    ]}
                    connectButton={{
                        label: "Sign In",
                        style: {
                            width: "100%",
                            height: "40px",
                            borderRadius: "8px",
                        }
                    }}
                    detailsButton={{
                        style: {
                            width: "100%",
                            borderRadius: "8px",
                        }
                    }}
                />
            </CardFooter>
            </Card>
            {account && (
                <Card className="w-full max-w-md mx-auto mt-4">
                    <CardHeader>
                        <CardTitle>Blockchain Interaction</CardTitle>
                        <CardDescription>Interact with the blockchain with your connected wallet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center text-center mb-6">
                            <p className="text-lg">Counter</p>
                            <p className="text-6xl font-bold mt-2">{
                                isCountLoading ? "0" : count?.toString()
                            }</p>
                        </div>
                        <Tabs defaultValue="tab1" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-200 p-1 rounded-lg">
                                <TabsTrigger 
                                    value="tab1"
                                    className="data-[state=active]:bg-white data-[state=active]:text-black rounded-md transition-all"
                                >
                                    Write
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="tab2"
                                    className="data-[state=active]:bg-white data-[state=active]:text-black rounded-md transition-all"
                                >
                                    Engine
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="tab1">
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium">Write to the blockchain</h3>
                                    <CardDescription className="mb-4">Execute a write transaction to the blockchain. Your wallet will execute and sign the transaction and pay for the gas fees.</CardDescription>
                                    <TransactionButton
                                        transaction={() => prepareContractCall({
                                            contract: contract,
                                            method: "increment",
                                            params: []
                                        })}
                                        onTransactionConfirmed={async () => alert("Incremented")}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#374151',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.375rem',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onError={(error) => console.error(error)}
                                    >Increment</TransactionButton>
                                </div>
                            </TabsContent>
                            <TabsContent value="tab2">
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium">Backend Server Interaction</h3>
                                    <CardDescription className="mb-4">Make a backend call to a backend wallet to execute the transaction. Gas is paid by the backend wallet.</CardDescription>
                                    <Button
                                        onClick={claimEngine}
                                        className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Loading..." : "Increment"}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
