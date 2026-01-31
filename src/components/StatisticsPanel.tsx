import { useState } from "react";
import { Card, Modal, Table } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Item } from "../types";

interface StatisticsPanelProps {
  items: Item[];
}

const formatPrice = (price: number) => {
  return price.toLocaleString("th-TH");
};

export const StatisticsPanel = ({ items }: StatisticsPanelProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState<any[]>([]);

  // คำนวณราคารวม sold ของแต่ละ owner
  const soldByOwner = items.reduce(
    (acc, item) => {
      if (item.status === "sold") {
        if (!acc[item.owner]) acc[item.owner] = 0;
        acc[item.owner] += item.price;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // คำนวณราคารวม pending ของแต่ละ owner
  const pendingByOwner = items.reduce(
    (acc, item) => {
      if (item.status === "pending") {
        if (!acc[item.owner]) acc[item.owner] = 0;
        acc[item.owner] += item.price;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // ราคารวมทั้งหมด
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalPriceNet = items.reduce((sum, item) => {
    if (item.owner === "Neng") return sum + item.price;
    return sum ;
  }, 0);

  // ราคารวมแยก game
  const priceByGame = items.reduce(
    (acc, item) => {
      if (!acc[item.game]) acc[item.game] = 0;
      acc[item.game] += item.price;
      return acc;
    },
    {} as Record<string, number>,
  );

  // หา detail ที่มีจำนวนเยอะสุด
  const detailCount = items.reduce(
    (acc, item) => {
      if (item.status === "sold") {
        const details = item.detail.split(",").map((d) => d.trim());
        details.forEach((detail) => {
          if (!acc[detail]) acc[detail] = 0;
          acc[detail] += 1;
        });
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // หา detail ที่ขายได้เยอะสุด (สำหรับ modal)
  const detailRevenue = items.reduce(
    (acc, item) => {
      if (item.status === "sold") {
        const details = item.detail.split(",").map((d) => d.trim());
        details.forEach((detail) => {
          if (!acc[detail]) acc[detail] = 0;
          acc[detail] += item.price;
        });
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const topDetail = Object.entries(detailCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const handleOwnerCardClick = (owner: string) => {
    setModalTitle(`${owner} - Sold & Pending`);
    const ownerItems = items.filter((item) => item.owner === owner);
    const data = [
      {
        key: "sold",
        status: "Sold",
        amount: soldByOwner[owner] || 0,
        count: ownerItems.filter((i) => i.status === "sold").length,
      },
      {
        key: "pending",
        status: "Pending",
        amount: pendingByOwner[owner] || 0,
        count: ownerItems.filter((i) => i.status === "pending").length,
      },
    ];
    setModalData(data);
    setModalVisible(true);
  };

  const handleGameCardClick = () => {
    setModalTitle("ราคารวมแยกตาม Game");
    const data = Object.entries(priceByGame)
      .map(([game, amount]) => ({
        key: game,
        game,
        amount,
        count: items.filter((i) => i.game === game).length,
      }))
      .sort((a, b) => b.amount - a.amount);
    setModalData(data);
    setModalVisible(true);
  };

  const handleDetailCardClick = () => {
    setModalTitle("ราคารวมแยกตาม Detail");
    const data = Object.entries(detailRevenue)
      .map(([detail, amount]) => ({
        key: detail,
        detail,
        amount,
        count: items.filter((item) => item.status === "sold" && item.detail.includes(detail)).length,
      }))
      .sort((a, b) => b.count - a.count);
    setModalData(data);
    setModalVisible(true);
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-4" style={{ marginBottom: "24px" }}>
        {/* Total Price Card */}
        <Card
          style={{ minWidth: "200px", background: "#2a2a2a", borderColor: "#333333", cursor: "pointer" }}
          onClick={() => {
            setModalTitle("ทั้งหมด - ราคารวม");
            setModalData([
              {
                key: "total",
                label: "ราคารวมทั้งหมด",
                amount: totalPrice,
                count: items.length,
              },
            ]);
            setModalVisible(true);
          }}
          className="h-30 hover:bg-[#353535]!"
        >
          <div style={{ marginBottom: "2px" }} className="">
            <strong className="text-[#848484]">ราคารวมทั้งหมด</strong>
          </div>
          <div className="flex font-medium text-[18px]">
            Net :<span className="ml-auto text-green-400 mx-1">{formatPrice(totalPriceNet)}</span>
            บาท
          </div>
          <div className="flex font-medium text-[18px]">
            Total :<span className="ml-auto text-sky-400 mx-1">{formatPrice(totalPrice)}</span>
            บาท
          </div>
        </Card>

        {/* Owner Cards */}
        {["Neng", "Joy"].map((owner) => (
          <Card
            key={owner}
            style={{
              minWidth: "250px",
              background: "#2a2a2a",
              borderColor: "#333333",
              cursor: "pointer",
            }}
            onClick={() => handleOwnerCardClick(owner)}
            className="h-30 hover:bg-[#353535]!"
          >
            <div style={{ marginBottom: "8px" }} className="text-center">
              <strong className="text-[#848484]">{owner}</strong>
            </div>
            <div className="flex font-medium mb-1">
              <span className="">Sold :</span>
              <span className="ml-auto text-green-400 mr-1">{formatPrice(soldByOwner[owner] || 0)}</span>
              บาท
            </div>
            <div className="flex font-medium">
              <span className="">Pending :</span>
              <span className="ml-auto text-sky-400 mr-1">{formatPrice(pendingByOwner[owner] || 0)}</span>
              บาท
            </div>
          </Card>
        ))}

        {/* Top Detail Card */}
        <Card
          style={{
            minWidth: "200px",
            background: "#2a2a2a",
            borderColor: "#333333",
            cursor: "pointer",
          }}
          onClick={handleDetailCardClick}
          className="h-30 hover:bg-[#353535]!"
        >
          <div className="text-center">
            <strong>Detail เยอะสุด</strong>
            <div style={{ fontSize: "12px", color: "#b3b3b3" }}>
              {topDetail.map(([detail, count]) => (
                <div key={detail} className="flex justify-between text-[14px]">
                  <span> {detail} </span>
                  <span> {count} ID</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Game Summary Card */}
        <Card
          style={{
            minWidth: "200px",
            background: "#2a2a2a",
            borderColor: "#333333",
            cursor: "pointer",
          }}
          onClick={handleGameCardClick}
          className="h-30 hover:bg-[#353535]!"
        >
          <div className="text-center">
            <strong>ราคารวมแยก Game</strong>
            <div style={{ fontSize: "14px", color: "#b3b3b3" }}>
              {Object.entries(priceByGame)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([game, amount]) => (
                  <div key={game} className="flex">
                    <span>{game}</span>
                    <span className="ml-auto">{formatPrice(amount)} บาท</span>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
        style={{ maxHeight: "90vh" }}
        bodyStyle={{ maxHeight: "80vh", overflow: "auto" }}
      >
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ color: "#d9d9d9", marginBottom: "16px" }}>จำนวนสินค้า (ชิ้น)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={modalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis dataKey={(record: any) => record.status || record.game || record.detail || record.label} stroke="#b3b3b3" />
              <YAxis stroke="#b3b3b3" />
              <Tooltip contentStyle={{ backgroundColor: "#2a2a2a", border: "1px solid #404040", color: "#d9d9d9" }} cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} />
              <Legend wrapperStyle={{ color: "#b3b3b3" }} />
              <Line type="monotone" dataKey="count" stroke="#52c41a" name="จำนวน (ชิ้น)" dot={{ fill: "#52c41a", r: 5 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 style={{ color: "#d9d9d9", marginBottom: "16px" }}>ราคารวม (บาท)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={modalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis dataKey={(record: any) => record.status || record.game || record.detail || record.label} stroke="#b3b3b3" />
              <YAxis stroke="#b3b3b3" />
              <Tooltip contentStyle={{ backgroundColor: "#2a2a2a", border: "1px solid #404040", color: "#d9d9d9" }} cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} />
              <Legend wrapperStyle={{ color: "#b3b3b3" }} />
              <Line type="monotone" dataKey="amount" stroke="#1890ff" name="ราคา (บาท)" dot={{ fill: "#1890ff", r: 5 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: "40px" }}>
          <h3 style={{ color: "#d9d9d9", marginBottom: "16px" }}>สรุปข้อมูล</h3>
          <Table
            dataSource={modalData}
            columns={[
              {
                title: "รายการ",
                dataIndex: "detail",
                key: "detail",
                render: (_: any, record: any) => record.status || record.game || record.detail || record.label,
              },
              {
                title: "จำนวน (ชิ้น)",
                dataIndex: "count",
                key: "count",
              },
              {
                title: "ราคารวม (บาท)",
                dataIndex: "amount",
                key: "amount",
                render: (amount: number) => formatPrice(amount),
              },
            ]}
            pagination={false}
            size="small"
          />
        </div>
      </Modal>
    </>
  );
};
