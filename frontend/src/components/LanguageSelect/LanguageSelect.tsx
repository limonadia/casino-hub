import Select, { components } from "react-select";
import enFlag from "../../assets/en.png";
import alFlag from "../../assets/al.png";
import "./LanguageSelect.css";

const options = [
  { value: "en", icon: enFlag },
  { value: "al", icon: alFlag },
];

const Option = (props: any) => (
  <components.Option {...props} className={props.className}>
    <div className="flex items-center gap-2 w-12 m-2">
      <img src={props.data.icon} alt={props.data.value} className="w-full"/>
    </div>
  </components.Option>
);

const SingleValue = (props: any) => (
  <components.SingleValue {...props} className={props.className}>
    <div className="flex items-center gap-2 w-12 my-2 ml-2">
      <img src={props.data.icon} alt={props.data.value} className="w-full"/>
    </div>
  </components.SingleValue>
);

function LanguageSelect() {
  return (
    <Select
      classNamePrefix="react-select"
      options={options}
      defaultValue={options[0]}
      components={{ Option, SingleValue ,
        IndicatorSeparator: () => null    }}
      getOptionValue={(e: { value: any; }) => e.value}
    />
  );
}

export default LanguageSelect;
