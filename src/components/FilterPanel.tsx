import { Card, Button, Select, DatePicker } from "antd";
import { ClearOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { FilterOptions } from "../types";

interface FilterPanelProps {
  filters: Partial<FilterOptions>;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  availableDetails: string[];
}

export const FilterPanel = ({ filters, onFilterChange, availableDetails }: FilterPanelProps) => {
  const handleOwnerChange = (values: string[]) => {
    onFilterChange({ ...filters, owner: values });
  };

  const handleStatusChange = (values: string[]) => {
    onFilterChange({ ...filters, status: values });
  };

  const handleGameChange = (values: string[]) => {
    onFilterChange({ ...filters, game: values });
  };

  const handleDetailsChange = (values: string[]) => {
    onFilterChange({ ...filters, details: values });
  };

  const handleCreatedAtRangeChange = (dates: any) => {
    onFilterChange({ ...filters, createdAtRange: dates });
  };

  // ถ้าก่อน 09:00 ให้ถือเป็นเมื่อวาน
  const getBaseDay = () => (dayjs().hour() < 9 ? dayjs().subtract(1, "day") : dayjs());

  const presets = [
    {
      label: "วันนี้",
      value: (): [dayjs.Dayjs, dayjs.Dayjs] => {
        const baseDay = getBaseDay();
        return [baseDay, baseDay.add(1, "day")];
      },
    },
    {
      label: "เดือนนี้",
      value: (): [dayjs.Dayjs, dayjs.Dayjs] => {
        const baseDay = getBaseDay();
        return [baseDay.startOf("month"), baseDay.endOf("month").add(1, "day")];
      },
    },
  ];

  const handleClearFilters = () => {
    onFilterChange({
      owner: [],
      status: [],
      game: [],
      details: [],
      createdAtRange: undefined,
    });
  };

  return (
    <Card style={{ marginBottom: "24px" }}>
      <div className="grid grid-cols-5 gap-4">
        {/* Owner Filter */}
        <div className="col-span-1">
          <h4 style={{ marginBottom: "12px", fontWeight: "bold" }}>Owner</h4>
          <Select
            mode="multiple"
            placeholder="เลือก"
            value={filters.owner || []}
            onChange={handleOwnerChange}
            options={["Neng", "Joy"].map((v) => ({ label: v, value: v }))}
            style={{ width: "100%" }}
            showSearch
            allowClear
          />
        </div>

        {/* Status Filter */}
        <div className="">
          <h4 style={{ marginBottom: "12px", fontWeight: "bold" }}>Status</h4>
          <Select
            mode="multiple"
            placeholder="เลือก"
            value={filters.status || []}
            onChange={handleStatusChange}
            options={["sold", "pending"].map((v) => ({ label: v, value: v }))}
            style={{ width: "100%" }}
            showSearch
            allowClear
          />
        </div>

        {/* Game Filter */}
        <div className="">
          <h4 style={{ marginBottom: "12px", fontWeight: "bold" }}>Game</h4>
          <Select
            mode="multiple"
            placeholder="เลือก"
            value={filters.game || []}
            onChange={handleGameChange}
            options={["pes", "lrg", "payroll"].map((v) => ({ label: v, value: v }))}
            style={{ width: "100%" }}
            showSearch
            allowClear
          />
        </div>

        {/* Details Filter */}
        <div className="">
          <h4 style={{ marginBottom: "12px", fontWeight: "bold" }}>Detail</h4>
          <Select
            mode="multiple"
            placeholder="เลือก"
            value={filters.details || []}
            onChange={handleDetailsChange}
            options={availableDetails.map((v) => ({ label: v, value: v }))}
            style={{ width: "100%" }}
            showSearch
            allowClear
            maxTagCount="responsive"
          />
        </div>

        {/* Created At Range Filter */}
        <div className="">
          <h4 style={{ marginBottom: "12px", fontWeight: "bold" }}>Created At</h4>
          <DatePicker.RangePicker
            value={filters.createdAtRange ? [dayjs(filters.createdAtRange[0]), dayjs(filters.createdAtRange[1])] : [null, null]}
            onChange={handleCreatedAtRangeChange}
            style={{ width: "100%" }}
            placeholder={["วันเริ่มต้น", "วันสิ้นสุด"]}
            presets={presets}
          />
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
          ล้างฟิลเตอร์
        </Button>
      </div>
    </Card>
  );
};
