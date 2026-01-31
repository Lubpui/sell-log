import { useEffect, useState, useMemo, useCallback } from "react";
import { ConfigProvider, theme, Layout, Spin, Empty, Card, Button, message } from "antd";
import dayjs from "dayjs";
import type { Item, FilterOptions } from "./types";
import { getItems } from "./api/sheetbest";
import { updateDetailsStorage, getDetailsFromStorage, saveFiltersToStorage, getFiltersFromStorage } from "./utils/storage";
import { AddItemButton } from "./components/AddItemButton";
import { FilterPanel } from "./components/FilterPanel";
import { ItemTable } from "./components/ItemTable";
import { StatisticsPanel } from "./components/StatisticsPanel";
import { CreditCardOutlined, LinkOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

const App = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Initialize filters from localStorage
  const [filters, setFilters] = useState<Partial<FilterOptions>>(() => {
    const savedFilters = getFiltersFromStorage();
    const today = dayjs();
    const firstDayOfMonth = today.startOf("month");
    const lastDayOfMonth = today.endOf("month");
    return (
      savedFilters || {
        owner: [],
        status: [],
        game: [],
        details: [],
        createdAtRange: [firstDayOfMonth.toDate(), lastDayOfMonth.toDate()],
      }
    );
  });

  const [availableDetails, setAvailableDetails] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const data = await getItems();
    setItems(data);
    updateDetailsStorage(data);
    setAvailableDetails(getDetailsFromStorage());
    setLoading(false);
    setIsFirstLoad(false);
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    saveFiltersToStorage(filters);
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (filters.owner && filters.owner.length > 0) {
      result = result.filter((item) => filters.owner!.includes(item.owner));
    }

    if (filters.status && filters.status.length > 0) {
      result = result.filter((item) => filters.status!.includes(item.status));
    }

    if (filters.game && filters.game.length > 0) {
      result = result.filter((item) => filters.game!.includes(item.game));
    }

    if (filters.details && filters.details.length > 0) {
      result = result.filter((item) => {
        const itemDetails = item.detail.split(",").map((d) => d.trim());
        return filters.details!.some((d) => itemDetails.includes(d));
      });
    }
    if (filters.createdAtRange && filters.createdAtRange.length === 2) {
      const startDate = dayjs(filters.createdAtRange[0]);
      const endDate = dayjs(filters.createdAtRange[1]);

      // Range: startDate 09:00 to endDate+1 day 08:59
      const rangeStart = startDate.hour(9).minute(0).second(0);
      const rangeEnd = endDate.add(1, "day").hour(8).minute(59).second(59);

      result = result.filter((item) => {
        if (!item.createdAt) return false;
        const itemDate = dayjs(item.createdAt);
        return itemDate.isAfter(rangeStart) && itemDate.isBefore(rangeEnd);
      });
    }

    return result;
  }, [items, filters]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#615fff",
          colorBgBase: "#1f1f1f",
          colorBgContainer: "#1f1f1f",
          colorBgElevated: "#1f1f1f",
          colorBorder: "#404040",
          colorText: "#e6e6e6",
          colorTextSecondary: "#b3b3b3",
          borderRadius: 10,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "#1f1f1f" }}>
        <Header
          style={{
            background: "#1f1f1f",
            padding: "0 50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #333333",
          }}
        >
          <h1
            style={{
              color: "#d9d9d9",
              margin: 0,
              fontSize: "28px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            ระบบจัดการสินค้า
          </h1>
        </Header>

        <Content style={{ padding: "24px", background: "#1f1f1f" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <StatisticsPanel items={filteredItems} />

            <FilterPanel filters={filters} onFilterChange={setFilters} availableDetails={availableDetails} />

            <div className="flex gap-4 items-end justify-between" style={{ marginBottom: "24px" }}>
              <div className="flex gap-4">
                <AddItemButton
                  onItemAdded={fetchItems}
                  availableDetails={availableDetails}
                  onNewItemAdded={(newItem: any) => {
                    setItems([newItem as Item, ...items]);
                    setEditingId(newItem.id || "");
                  }}
                />

                <Button
                  type="primary"
                  className="bg-red-500! hover:bg-red-400! shadow-none!"
                  size="large"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    window.open(
                      "https://my.konami.net/en_GB/password-reminder/input-email-address",
                      "_blank", // เปิดแท็บใหม่
                    );
                  }}
                >
                  <span className="font-bold">Konami</span>
                </Button>

                <Button
                  type="primary"
                  className="bg-green-400! hover:bg-green-300! shadow-none!"
                  size="large"
                  icon={<CreditCardOutlined className="text-green-900!" />}
                  onClick={() => {
                    navigator.clipboard.writeText("0942049873\nพร้อมเพ or วอเลท\nวัชรพล เชื้อวงษ์");
                    message.success("คัดลอกเลขบัญชีแล้ว");
                  }}
                >
                  <span className="font-bold text-green-900">เลขบัญชี</span>
                </Button>
              </div>

              <div className="text-[24px]">
                <span className="text-indigo-400">{filteredItems.length}</span> / {items.length}
              </div>
            </div>

            <Card style={{ marginTop: "24px", background: "#2a2a2a", borderColor: "#333333" }} bodyStyle={{ padding: 0 }} loading={loading && isFirstLoad}>
              {loading && isFirstLoad ? (
                <Spin
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "50px",
                    color: "#8c8c8c",
                  }}
                />
              ) : filteredItems.length === 0 ? (
                <Empty description="ไม่พบข้อมูล" />
              ) : (
                <ItemTable
                  items={filteredItems}
                  onItemsChange={fetchItems}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  availableDetails={availableDetails}
                  onRemoveNewItem={(id) => setItems(items.filter((item) => item.id !== id))}
                />
              )}
            </Card>
          </div>
        </Content>

        <Footer style={{ textAlign: "center", color: "#666", background: "#1f1f1f", borderTop: "1px solid #333333" }}>©2026 ระบบจัดการสินค้า</Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
