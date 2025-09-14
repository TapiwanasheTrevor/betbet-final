"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Upload, Database, Globe, BarChart3, TrendingUp, FileText, Users } from "lucide-react"

const dataSources = [
  {
    id: 1,
    name: "Sports Statistics API",
    type: "API",
    status: "connected",
    lastSync: "2 hours ago",
    records: "2.3M",
    icon: BarChart3,
  },
  {
    id: 2,
    name: "Market Data Feed",
    type: "Live Feed",
    status: "connected",
    lastSync: "Real-time",
    records: "Live",
    icon: TrendingUp,
  },
  {
    id: 3,
    name: "Historical Odds Data",
    type: "CSV Upload",
    status: "processing",
    lastSync: "1 day ago",
    records: "450K",
    icon: FileText,
  },
  {
    id: 4,
    name: "Weather Data",
    type: "API",
    status: "disconnected",
    lastSync: "Never",
    records: "0",
    icon: Globe,
  },
]

const datasets = [
  {
    id: 1,
    name: "NFL Team Performance 2024",
    size: "2.1 MB",
    rows: "1,247",
    columns: "45",
    lastModified: "3 hours ago",
    shared: true,
  },
  {
    id: 2,
    name: "Crypto Price Movements",
    size: "5.8 MB",
    rows: "8,934",
    columns: "12",
    lastModified: "1 day ago",
    shared: false,
  },
  {
    id: 3,
    name: "Election Polling Data",
    size: "1.3 MB",
    rows: "567",
    columns: "23",
    lastModified: "2 days ago",
    shared: true,
  },
]

export function AnalysisDashboard() {
  const [activeTab, setActiveTab] = useState("sources")

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Data Analysis Workspace</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Data
          </Button>
          <Button>
            <Database className="w-4 h-4 mr-2" />
            Connect API
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="datasets">My Datasets</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {dataSources.map((source) => {
              const Icon = source.icon
              return (
                <Card key={source.id} className="group hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{source.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{source.type}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          source.status === "connected"
                            ? "default"
                            : source.status === "processing"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {source.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Sync:</span>
                        <div className="font-medium">{source.lastSync}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Records:</span>
                        <div className="font-medium">{source.records}</div>
                      </div>
                    </div>

                    {source.status === "processing" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing...</span>
                          <span>67%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        variant={source.status === "connected" ? "outline" : "default"}
                      >
                        {source.status === "connected" ? "Configure" : "Connect"}
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="datasets" className="space-y-4">
          <div className="grid gap-4">
            {datasets.map((dataset) => (
              <Card key={dataset.id} className="group hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{dataset.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{dataset.size}</span>
                          <span>{dataset.rows} rows</span>
                          <span>{dataset.columns} columns</span>
                          <span>Modified {dataset.lastModified}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {dataset.shared && (
                        <Badge variant="outline" className="gap-1">
                          <Users className="w-3 h-3" />
                          Shared
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        Analyze
                      </Button>
                      <Button size="sm">Open</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
