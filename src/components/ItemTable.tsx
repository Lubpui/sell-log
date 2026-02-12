import { useState, useEffect } from "react";
import { Table, Button, Space, Select, InputNumber, Tag, Popconfirm, message, Spin } from "antd";
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { Item } from "../types";
import { updateItem, deleteItem, addItem } from "../api/sheetbest";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

interface ItemTableProps {
  items: Item[];
  onItemsChange: () => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  availableDetails: string[];
  onRemoveNewItem?: (id: string) => void;
}

const formatPrice = (price: number) => {
  return price.toLocaleString("th-TH");
};

export const ItemTable = ({ items, onItemsChange, editingId, setEditingId, availableDetails, onRemoveNewItem }: ItemTableProps) => {
  const [editData, setEditData] = useState<Partial<Item>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [detailSearchValue, setDetailSearchValue] = useState<string>("");
  // Auto-populate editData when editingId changes
  useEffect(() => {
    if (editingId) {
      const item = items.find((i) => i.id === editingId);
      if (item) {
        setEditData(item);
      }
    }
  }, [editingId, items]);

  const handleStartEdit = (item: Item) => {
    setEditingId(item.id || "");
    setEditData(item);
  };

  const handleInputChange = (field: keyof Item, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (editingId && editData) {
      setSavingId(editingId);
      try {
        // Check if it's a new item (temp_* id)
        if (editingId === "create") {
          // Create new item - remove temp id
          const newItemData: Omit<Item, "id"> = {
            owner: editData.owner!,
            detail: editData.detail!,
            price: editData.price!,
            status: editData.status!,
            game: editData.game!,
            createdAt: editData.createdAt!,
            createdBy: "Neng",
          };
          const result = await addItem(newItemData);
          if (result) {
            message.success("เพิ่มรายการสำเร็จ");
            onRemoveNewItem?.(editingId);
            setEditingId(null);
            onItemsChange();
          } else {
            message.error("เพิ่มรายการล้มเหลว");
          }
        } else {
          // Update existing item
          const { id:_, ...editDataWithOurId } = editData;
          const success = await updateItem(editingId, editDataWithOurId);
          if (success) {
            message.success("แก้ไขรายการสำเร็จ");
            setEditingId(null);
            onItemsChange();
          } else {
            message.error("แก้ไขรายการล้มเหลว");
          }
        }
      } finally {
        setSavingId(null);
      }
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (id) {
      const success = await deleteItem(id);
      if (success) {
        onItemsChange();
      }
    }
  };

  const handleCancel = () => {
    if (editingId === "create") {
      onRemoveNewItem?.(editingId);
    }
    setEditingId(null);
  };

  const renderDetailChips = (detail: string) => {
    if (!detail) return "-";
    return detail.split(",").map((chip, index) => (
      <Tag key={chip.trim()} className={`${index === 0 ? "bg-[#674d7b]!" : "bg-[#7b4760]!"} font-medium text-[16px]! h-6.75!`}>
        {chip.trim()}
      </Tag>
    ));
  };

  const formatCreatedAt = (dateString: string | undefined): string => {
    if (!dateString) return "-";
    try {
      // Parse ISO string or date-only string
      let date = dayjs(dateString);

      // // If not valid, try parsing as YYYY-MM-DD
      if (!date.isValid()) {
        date = dayjs(dateString, "YYYY-MM-DD");
      }

      // If only date format (YYYY-MM-DD), set default time 09:00
      if (!dateString.includes("T") && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = date.hour(9).minute(0).second(0);
      }

      return date.format("DD/MM/YYYY HH:mm");
    } catch {
      return dateString;
    }
  };

  const columns: any[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
      width: 100,
      render: (text: string, record: Item) =>
        editingId === record.id ? (
          <Select
            value={editData.owner || ""}
            onChange={(value) => handleInputChange("owner", value)}
            options={[
              { label: "Neng", value: "Neng" },
              { label: "Joy", value: "Joy" },
            ]}
            style={{ width: "100%" }}
            defaultValue={"Neng"}
          />
        ) : (
          text
        ),
    },
    {
      title: "Detail",
      dataIndex: "detail",
      key: "detail",
      width: 200,
      render: (text: string, record: Item) => {
        const currentValues = editData.detail ? editData.detail.split(",").map((d) => d.trim()) : [];
        const options = availableDetails.map((d) => ({ label: d, value: d }));

        // Add option for creating new detail if search value is not empty and not already in options
        if (detailSearchValue && !availableDetails.includes(detailSearchValue)) {
          options.push({ label: `+ เพิ่ม "${detailSearchValue}"`, value: detailSearchValue });
        }

        return editingId === record.id ? (
          <Select
            mode="multiple"
            value={currentValues}
            onChange={(values) => {
              handleInputChange("detail", values.join(", "));
              setDetailSearchValue("");
            }}
            onSearch={(value) => setDetailSearchValue(value)}
            options={options}
            placeholder="พิมเพื่อค้นหา หรือสร้างใหม่"
            showSearch
            style={{ width: "100%" }}
            maxTagCount="responsive"
          />
        ) : (
          <div className="flex gap-2">{renderDetailChips(text)}</div>
        );
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      align: "right" as const,
      render: (text: number, record: Item) =>
        editingId === record.id ? <InputNumber value={editData.price || 0} onChange={(value) => handleInputChange("price", value)} style={{ width: "100%" }} /> : formatPrice(text),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text: string, record: Item) =>
        editingId === record.id ? (
          <Select
            value={editData.status || ""}
            onChange={(value) => handleInputChange("status", value)}
            options={[
              { label: "sold", value: "sold" },
              { label: "pending", value: "pending" },
            ]}
            style={{ width: "100%" }}
            defaultValue={"sold"}
          />
        ) : (
          <Tag className={`${text === "sold" ? "bg-emerald-700!" : "bg-blue-500!"} font-medium text-[16px]! h-6.75!`}>{text}</Tag>
        ),
    },
    {
      title: "Game",
      dataIndex: "game",
      key: "game",
      width: 100,
      render: (text: string, record: Item) =>
        editingId === record.id ? (
          <Select
            value={editData.game || ""}
            onChange={(value) => handleInputChange("game", value)}
            options={[
              { label: "pes", value: "pes" },
              { label: "lrg", value: "lrg" },
              { label: "payroll", value: "payroll" },
            ]}
            style={{ width: "100%" }}
            defaultValue={"pes"}
          />
        ) : (
          <Tag className={`${text === "pes" ? "bg-orange-300! text-orange-900!" : text === "lrg" ? "bg-green-300! text-green-900!" : "bg-blue-500!"} font-medium text-[16px]! h-6.75!`}>{text}</Tag>
        ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (text: string) => formatCreatedAt(text),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 100,
      render: (text: string) => text || "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_: any, record: Item) =>
        editingId === record.id ? (
          <Space>
            <Spin size="small" spinning={savingId === record.id}>
              <Button type="primary" size="small" icon={<CheckOutlined />} onClick={handleSave} disabled={savingId === record.id} />
            </Spin>
            <Button size="small" icon={<CloseOutlined />} onClick={handleCancel} disabled={savingId === record.id} />
          </Space>
        ) : (
          <Space>
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleStartEdit(record)} />
            <Popconfirm title="ลบรายการ" description="ต้องการลบรายการนี้?" onConfirm={() => handleDelete(record.id)} okText="ใช่" cancelText="ไม่">
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || "").getTime();
    const dateB = new Date(b.createdAt || "").getTime();
    return dateB - dateA;
  });

  return (
    <Table
      columns={columns}
      dataSource={sortedItems}
      rowKey="id"
      pagination={{ pageSize: 10, total: sortedItems.length }}
      scroll={{ x: 1200 }}
      onRow={(record) => ({
        onDoubleClick: () => handleStartEdit(record),
        style: { cursor: "pointer" },
      })}
    />
  );
};
