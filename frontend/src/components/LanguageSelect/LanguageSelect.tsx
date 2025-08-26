import Select, { components } from "react-select";
import enFlag from "../../assets/en.png";
import alFlag from "../../assets/al.png";
import "./LanguageSelect.css";
import i18n from "../../i18n";
import { type SingleValue } from "react-select";

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
  const handleChange = (newValue: SingleValue<{ value: string; icon: string }>) => {
    if (newValue) {
      i18n.changeLanguage(newValue.value); // switch language
    }
  };

  const defaultLang = options.find(o => o.value === i18n.language) || options[0];
  
  return (
    <Select
      classNamePrefix="react-select"
      options={options}
      defaultValue={defaultLang}
      onChange={handleChange}
      components={{ Option, SingleValue ,
        IndicatorSeparator: () => null    }}
      getOptionValue={(e: { value: any; }) => e.value}
    />
  );
}

export default LanguageSelect;
