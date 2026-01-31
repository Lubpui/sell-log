import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface AddItemButtonProps {
  onItemAdded: () => void;
  availableDetails: string[];
  onNewItemAdded: (item: any) => void;
}

export const AddItemButton = ({ onNewItemAdded }: AddItemButtonProps) => {
  const handleAddClick = () => {
    const dummyItem: any = {
      id: "create",
      owner: "Neng",
      detail: "",
      price: 0,
      status: "sold",
      game: "pes",
      createdAt: dayjs().format("YYYY/MM/DD HH:mm"),
      createdBy: "Neng",
    };

    onNewItemAdded(dummyItem);
  };

  return (
    <Button className="shadow-none!" type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddClick}>
      เพิ่มรายการใหม่
    </Button>
  );
};
