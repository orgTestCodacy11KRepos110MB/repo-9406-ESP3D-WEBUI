/*
 Mask.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

import { h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { Flag } from "preact-feather"
import {
    useUiContext,
    useUiContextFn,
    useSettingsContext,
    SettingsContextProvider,
} from "../../../contexts"
import {
    generateDependIds,
    connectionDepend,
    settingsDepend,
    BitsArray,
} from "../../Helpers"

import Boolean from "./Boolean"
import FormGroup from "./FormGroup"
import FieldGroup from "../FieldGroup"

/*
 * Local const
 *
 */
const Mask = ({
    initial,
    id,
    label,
    validation,
    value = 0,
    type,
    depend,
    setValue,
    inline,
    options = [],
    ...rest
}) => {
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const dependIds = generateDependIds(
        depend,
        interfaceSettings.current.settings
    )
    const canshow = connectionDepend(depend, connectionSettings.current)

    useEffect(() => {
        let visible =
            canshow &&
            settingsDepend(depend, interfaceSettings.current.settings)
        document.getElementById(id).style.display = visible ? "block" : "none"
        if (document.getElementById("group-" + id))
            document.getElementById("group-" + id).style.display = visible
                ? "block"
                : "none"
    }, [...dependIds])
    if (options && options.length == 0) {
        console.log("No options specified, should we use axis ?")
    }
    useEffect(() => {
        //to update state
        if (setValue) setValue(null, true)
    }, [value])
    const mask = Object.assign({}, BitsArray.fromInt(value, options.length))
    const maskinitial = Object.assign(
        {},
        BitsArray.fromInt(initial, options.length)
    )

    const [controlEnabled, setControlEnabled] = useState(
        type == "xmask" ? mask.getBit(0) : true
    )

    return (
        <FieldGroup className="m-1 control-fieldset" id={id} label={label}>
            {options.map((option, index) => {
                const [validation, setvalidation] = useState()
                const generateValidation = (fieldData) => {
                    let validation = {
                        message: <Flag size="1rem" />,
                        valid: true,
                        modified: true,
                    }
                    if (maskinitial.getBit(index) != mask.getBit(index)) {
                        validation.modified = true
                        fieldData.hasmodified = true
                    } else {
                        validation.modified = false
                        fieldData.hasmodified = false
                    }

                    return validation.modified ? validation : null
                }
                const FieldData = {
                    id: id + "M" + index,
                    value: mask.getBit(option.value),
                    initial: mask.getBit(option.value),
                    label: label,
                    type: "boolean",
                    haserror: false,
                    hasmodified: false,
                    validation: validation,
                    inline: true,
                }
                if (
                    controlEnabled ||
                    parseInt(option.value) == 0 ||
                    type == "mask"
                )
                    return (
                        <FormGroup {...FieldData}>
                            <Boolean
                                id={id + "M" + index}
                                label={option.label}
                                value={mask.getBit(option.value)}
                                setValue={(val, update) => {
                                    if (!update) {
                                        mask.setBit(index, val)
                                        if (
                                            type == "xmask" &&
                                            parseInt(option.value) == 0
                                        ) {
                                            setControlEnabled(val)
                                        }
                                    }
                                    setValue(mask.toInt(), update)

                                    setvalidation(generateValidation(FieldData))
                                }}
                                inline={true}
                                validation={validation}
                            />
                        </FormGroup>
                    )
            })}
        </FieldGroup>
    )
}

export default Mask