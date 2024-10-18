import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ConnectButton, lightTheme, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "@/app/client";
import { sepolia } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
import { addSessionKey, getAllActiveSigners, removeSessionKey } from "thirdweb/extensions/erc4337";
import { getContract, prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { contractABI, contractAddress } from "@/app/contract";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function AccountAbstractionCard() {
    const account = useActiveAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    const smartAccount = getContract({
        client: client,
        chain: sepolia,
        address: account?.address as string,
    });

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

    const { data: activeSigners, refetch: refetchActiveSigners } = useReadContract(
        getAllActiveSigners,
        {
            contract: smartAccount,
        }
    );

    const createSessionKey = async () => {
        if (!account) return;

        setIsLoading(true);
        try {
            const tx = addSessionKey({
                contract: smartAccount,
                account: account,
                sessionKeyAddress: "0x0B30B81531227161b9A09C1c2E01302a50942Cbd",
                permissions: {
                    approvedTargets: "*",
                    nativeTokenLimitPerTransaction: 0.1,
                    permissionStartTimestamp: new Date(),
                    permissionEndTimestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                }
            });

            await sendAndConfirmTransaction({
                account: account,
                transaction: tx,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            refetchActiveSigners();
        }
    };

    const deleteSessionKey = async (signer: string) => {
        if (!account) return;

        setIsLoading(true);
        try {
            const tx = removeSessionKey({
                contract: smartAccount,
                account: account,
                sessionKeyAddress: signer,
            });

            await sendAndConfirmTransaction({
                account: account,
                transaction: tx,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            refetchActiveSigners();
        }
    };

    const incrementWithEngine = async () => {
        setIsClaiming(true);
        try {
            const resp = await fetch("/api/sessionKey", {
                method: "POST",
                body: JSON.stringify({
                    accountAddress: account?.address
                })
            });

            const data = await resp.json();

            if (data.success) {
                alert("Incremented");
            } else {
                alert("Failed to increment");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsClaiming(false);
            refetchCount();
        }
    }

    return (
        <>
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Account Abstraction Wallet</CardTitle>
                    <CardDescription>Create a smart contract wallet for user using their selected EOA wallet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-green-100 p-4 rounded-md">
                            <h3 className="font-semibold mb-2">Why choose AA method:</h3>
                            <ul className="space-y-2 text-sm text-green-800">
                                <li className="flex items-start">
                                    <span className="mr-2">✅</span>
                                    <span>Improved user experience with gasless transactions and batch operations</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">✅</span>
                                    <span>Flexible key management and account recovery mechanisms</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">✅</span>
                                    <span>Supports session keys to sign transactions on behalf of the user</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-red-100 p-4 rounded-md">
                            <h3 className="font-semibold mb-2">Pain Points:</h3>
                            <ul className="space-y-2 text-sm text-red-800">
                                <li className="flex items-start">
                                    <span className="mr-2">❌</span>
                                    <span>User still needs a wallet to be the personal wallet of the smart contract wallet</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <ConnectButton 
                        client={client}
                        theme={lightTheme()}
                        accountAbstraction={{
                            chain: sepolia,
                            sponsorGas: true,
                        }}
                        wallets={[
                            createWallet("io.metamask"),
                            createWallet("com.coinbase.wallet"),
                            createWallet("com.trustwallet.app")
                        ]}
                        connectButton={{
                            label: "Connect Wallet",
                            style: {
                                width: "100%",
                                borderRadius: "8px",
                                height: "40px",
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
                <>
                    <Card className="w-full max-w-md mx-auto mt-4">
                        <CardHeader>
                        <CardTitle>Session Keys</CardTitle>
                        <CardDescription>Grant permissions to your smart contract wallet with session keys and have it sign transactions on your behalf.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Active Signers</h3>
                            <ul className="space-y-2">
                                {activeSigners && 
                                    activeSigners && activeSigners.length > 0 ? (
                                        activeSigners?.map((signer, index) => (
                                            <li key={index} className="flex items-center justify-between w-full">
                                                <span className="text-xs text-gray-500 border border-gray-300 rounded-full px-2 py-1">
                                                    {signer.signer}
                                                </span>
                                                <button 
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    onClick={() => deleteSessionKey(signer.signer)}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <p className="text-xs text-red-500">Removing...</p>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-500">No active signers</li>
                                    )
                                }
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full"
                            onClick={createSessionKey}
                            disabled={isLoading}
                        >{
                            isLoading ? "Creating..." : "Create Session Key"
                        }</Button>
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
                                            Session Key
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="tab1">
                                        <div className="mt-4">
                                            <h3 className="text-lg font-medium">Write to the blockchain</h3>
                                            <CardDescription className="mb-4">Execute a write transaction to the blockchain. Personal wallet will still have to sign the transaction.</CardDescription>
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
                                            >Increment</TransactionButton>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="tab2">
                                        <div className="mt-4">
                                            <h3 className="text-lg font-medium">Engine + Session Key</h3>
                                            <CardDescription className="mb-4">Use Engine to execute transactions for smart wallet but use session key to sign the transaction. Resulting in no pop-up for the user to sign the transaction.</CardDescription>
                                            {activeSigners && (
                                                activeSigners.length > 0 ? (
                                                    <Button
                                                        onClick={incrementWithEngine}
                                                        className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                                                        disabled={isClaiming}
                                                    >
                                                        {isClaiming ? "Loading..." : "Increment"}
                                                    </Button>
                                                ) : (
                                                    <p className="text-sm text-gray-500">Must create session key first.</p>
                                                )
                                            )}
                                            
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </>
    );
}
