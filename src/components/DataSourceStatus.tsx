
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataProvider } from '@/utils/dataProvider';
import { YahooFinanceAPI } from '@/utils/yahooFinanceAPI';
import { DataSourceInfo } from '@/types/trading';
import { Wifi, WifiOff, Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface DataSourceStatusProps {
  className?: string;
}

const DataSourceStatus: React.FC<DataSourceStatusProps> = ({ className }) => {
  const [dataSourceInfo, setDataSourceInfo] = useState<DataSourceInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    updateDataSourceInfo();
  }, []);

  const updateDataSourceInfo = async () => {
    setIsRefreshing(true);
    try {
      const info = DataProvider.getDataSourceInfo();
      setDataSourceInfo(info);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error updating data source info:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    updateDataSourceInfo();
  };

  if (!dataSourceInfo) {
    return (
      <Card className={`bg-gray-800 border-gray-700 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-400">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isRealData = dataSourceInfo.available;
  const StatusIcon = isRealData ? CheckCircle : AlertCircle;
  const ConnectionIcon = isRealData ? Wifi : WifiOff;

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" />
            <span className="text-white">Fuente de Datos</span>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ConnectionIcon className={`h-4 w-4 ${isRealData ? 'text-green-400' : 'text-orange-400'}`} />
              <span className="text-sm text-gray-300">Estado</span>
            </div>
            <Badge variant={isRealData ? "default" : "secondary"} className="text-xs">
              {isRealData ? 'Datos Reales' : 'Simulado'}
            </Badge>
          </div>

          {/* Data Source */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${isRealData ? 'text-green-400' : 'text-yellow-400'}`} />
              <span className="text-sm text-gray-300">Fuente</span>
            </div>
            <span className="text-xs text-gray-400">
              {dataSourceInfo.source}
            </span>
          </div>

          {/* Supported Pairs */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Pares Soportados</span>
            <Badge variant="outline" className="text-xs">
              {dataSourceInfo.supportedPairs}
            </Badge>
          </div>

          {/* Last Update */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Última Actualización</span>
            <span className="text-xs text-gray-400">
              {lastRefresh.toLocaleTimeString()}
            </span>
          </div>

          {/* Configuration Note */}
          {!isRealData && (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-md p-2 mt-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 text-yellow-400 mt-0.5" />
                <div className="text-xs">
                  <p className="text-yellow-200 font-medium">Usando datos simulados</p>
                  <p className="text-yellow-300/80 mt-1">
                    Configura VITE_ENABLE_REAL_DATA=true en .env.local para datos reales
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isRealData && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-md p-2 mt-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-400 mt-0.5" />
                <div className="text-xs">
                  <p className="text-green-200 font-medium">Conectado a Yahoo Finance</p>
                  <p className="text-green-300/80 mt-1">
                    Obteniendo datos de mercado en tiempo real
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSourceStatus;
