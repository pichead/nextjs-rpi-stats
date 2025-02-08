// import { getSystemDetails } from "@/lib/system";
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface ISystemInfo {
  hostname: string,
  platform: string,
  arch: string,
  cpuTemp: number;
  cpuUsage: string[];
  storage: {
    filesystem: string,
    size: string,
    used: string,
    available: string,
    usePercent: string,
    mountedOn: string
  }[],
  memoryUsage: {
    total: number;
    used: number;
    free: number;
  };
}



export default function Home() {


  const [systemInfo, setSystemInfo] = useState<ISystemInfo>({
    hostname: "",
    platform: "",
    arch: "",
    cpuTemp: 0,
    storage: [],
    cpuUsage: [],
    memoryUsage: {
      total: 0,
      used: 0,
      free: 0,
    }
  })

  const setup = async () => {
    const data = await fetch('/api/system', { method: "GET" }).then((res) => res.json());
    console.log(data)
    setSystemInfo({ ...data.data })
  }

  useEffect(() => {
    setup()
  }, [])

  // const systemInfo = await getSystemDetails()


  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground text-red-500">Raspberry Pi</h1>

      <Card className="w-full max-w-md bg-slate-400">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {[
              ["Hostname", systemInfo.hostname],
              ["Platform", systemInfo.platform],
              ["Architecture", systemInfo.arch],
              ["CPU Temperature", `${systemInfo.cpuTemp}°C`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}:</span>
                <span className="text-foreground font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Memory Usage</h3>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Used</span>
              <span>{systemInfo.memoryUsage.used.toFixed(2)} / {systemInfo.memoryUsage.total.toFixed(2)} GB</span>
            </div>
            <Progress
              value={(systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">CPU Usage</h3>
            {systemInfo.cpuUsage.map((usage, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Core {index + 1}</span>
                  <span>{usage}%</span>
                </div>
                <Progress value={parseFloat(usage)} className="h-2" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Storage Usage</h3>
            {systemInfo.storage.map((usage, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Storage {index + 1} Free {usage.available.replace("G","")} GB</span>
                  <span>{usage.used.replace("G","")} / {usage.size.replace("G","")} GB  {usage.usePercent}</span>
                </div>
                <Progress value={parseFloat(usage.usePercent.replace("%",""))} className="h-2" />
              </div>
            ))}
          </div>


        </CardContent>
      </Card>
    </main>
  );
}