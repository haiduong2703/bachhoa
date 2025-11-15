import { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart,
  Activity,
  Filter,
} from "lucide-react";
import { reportsAPI, statsAPI } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import toast from "react-hot-toast";

const AdminReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7days");
  const [reportType, setReportType] = useState("overview");
  const [dashboardStats, setDashboardStats] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerStats, setCustomerStats] = useState({});

  useEffect(() => {
    fetchReportsData();
  }, [dateRange, reportType]);

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);

      // Fetch real data from API
      const [dashboardResponse, topProductsResponse] = await Promise.all([
        statsAPI.getDashboardStats(),
        statsAPI.getTopProducts({ limit: 10 }),
      ]);

      const dashboardData = dashboardResponse.data.data;
      const topProductsData = topProductsResponse.data.data;

      // Transform dashboard stats
      setDashboardStats({
        totalRevenue: dashboardData.totalRevenue || 0,
        totalOrders: dashboardData.totalOrders || 0,
        totalCustomers: dashboardData.totalUsers || 0,
        totalProducts: dashboardData.totalProducts || 0,
        revenueGrowth: dashboardData.trends?.revenue?.percentage || 0,
        ordersGrowth: 0, // Can calculate from trends if needed
        customersGrowth: 0,
        productsGrowth: 0,
      });

      // Transform top products
      setTopProducts(
        topProductsData.topProducts?.map((item) => ({
          id: item.product?.id || item.productId,
          name: item.product?.name || "N/A",
          sales: parseInt(item.totalSold) || 0,
          revenue: parseFloat(item.totalRevenue) || 0,
          growth: 0, // Would need historical data
        })) || []
      );

      // Set customer stats (using available data)
      setCustomerStats({
        newCustomers: dashboardData.totalUsers || 0,
        returningCustomers: 0,
        averageOrderValue:
          dashboardData.totalOrders > 0
            ? Math.round(dashboardData.totalRevenue / dashboardData.totalOrders)
            : 0,
        customerLifetimeValue: 0,
        topCustomers: [],
      });

      // Sales data - for now empty, would need sales API
      setSalesData([]);
    } catch (error) {
      console.error("Failed to fetch reports data:", error);
      toast.error("Không thể tải dữ liệu báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      toast.success("Đang xuất báo cáo...");
      // await reportsAPI.exportSalesReport({ dateRange, reportType })
      // In real app, this would trigger a download
      setTimeout(() => {
        toast.success("Xuất báo cáo thành công");
      }, 2000);
    } catch (error) {
      toast.error("Không thể xuất báo cáo");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
    });
  };

  const getGrowthIndicator = (growth) => {
    const isPositive = growth > 0;
    return (
      <div
        className={`flex items-center ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-1" />
        )}
        <span className="text-sm font-medium">
          {isPositive ? "+" : ""}
          {growth.toFixed(1)}%
        </span>
      </div>
    );
  };

  const StatCard = ({ title, value, growth, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {growth !== undefined && (
            <div className="mt-2">{getGrowthIndicator(growth)}</div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const SalesChart = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Doanh thu theo ngày
        </h3>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">7 ngày qua</span>
        </div>
      </div>

      <div className="space-y-4">
        {salesData.map((day, index) => {
          const maxRevenue = Math.max(...salesData.map((d) => d.revenue));
          const percentage = (day.revenue / maxRevenue) * 100;

          return (
            <div key={day.date} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-600">
                {formatDate(day.date)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(day.revenue)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {day.orders} đơn
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const TopProductsTable = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Sản phẩm bán chạy
        </h3>
        <PieChart className="w-5 h-5 text-gray-400" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Sản phẩm
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Đã bán
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Doanh thu
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Tăng trưởng
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {topProducts.map((product, index) => (
              <tr key={product.id}>
                <td className="py-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right text-sm text-gray-900">
                  {product.sales}
                </td>
                <td className="py-3 text-right text-sm font-medium text-gray-900">
                  {formatPrice(product.revenue)}
                </td>
                <td className="py-3 text-right">
                  {getGrowthIndicator(product.growth)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CustomerInsights = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Thông tin khách hàng
        </h3>
        <Users className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {customerStats.newCustomers}
          </p>
          <p className="text-sm text-gray-600">Khách hàng mới</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {customerStats.returningCustomers}
          </p>
          <p className="text-sm text-gray-600">Khách hàng quay lại</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Giá trị đơn hàng trung bình
          </span>
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(customerStats.averageOrderValue)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Giá trị khách hàng trung bình
          </span>
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(customerStats.customerLifetimeValue)}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Top khách hàng
        </h4>
        <div className="space-y-2">
          {customerStats.topCustomers?.map((customer, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-medium text-purple-600">
                    {index + 1}
                  </span>
                </div>
                <span className="text-sm text-gray-900">{customer.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatPrice(customer.spent)}
                </div>
                <div className="text-xs text-gray-500">
                  {customer.orders} đơn
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Báo cáo & Thống kê
          </h1>
          <p className="text-gray-600 mt-1">
            Phân tích doanh thu và hiệu suất kinh doanh
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportReport}
            className="btn btn-outline flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="3months">3 tháng qua</option>
              <option value="6months">6 tháng qua</option>
              <option value="1year">1 năm qua</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại báo cáo
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input"
            >
              <option value="overview">Tổng quan</option>
              <option value="sales">Doanh thu</option>
              <option value="products">Sản phẩm</option>
              <option value="customers">Khách hàng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              So sánh với
            </label>
            <select className="input">
              <option value="previous">Kỳ trước</option>
              <option value="last_year">Cùng kỳ năm trước</option>
              <option value="none">Không so sánh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatPrice(dashboardStats.totalRevenue)}
          growth={dashboardStats.revenueGrowth}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={dashboardStats.totalOrders?.toLocaleString()}
          growth={dashboardStats.ordersGrowth}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Khách hàng"
          value={dashboardStats.totalCustomers?.toLocaleString()}
          growth={dashboardStats.customersGrowth}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Sản phẩm"
          value={dashboardStats.totalProducts?.toLocaleString()}
          growth={dashboardStats.productsGrowth}
          icon={Package}
          color="indigo"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <CustomerInsights />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TopProductsTable />
      </div>
    </div>
  );
};

export default AdminReports;
