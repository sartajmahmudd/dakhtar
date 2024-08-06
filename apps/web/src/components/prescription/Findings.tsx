import type { ChangeEvent } from 'react';
import React from 'react';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface Props {
    findingsName: string | null;
    selectedQuadrant: string | null;
    selectedTeethMap: Record<string, (string | number)[]>;
    handleFindingsName: (e: ChangeEvent<HTMLInputElement>) => void;
    handleQuadrant: (name: string) => void;
    handleSelectedTooth: (tooth: string | number) => void;
}

const Findings = (props: Props) => {
    const {
        findingsName,
        selectedQuadrant,
        selectedTeethMap,
        handleFindingsName,
        handleQuadrant,
        handleSelectedTooth
    } = props;

    const quadrants = ["Upper Right", "Upper Left", "Lower Right", "Lower Left"];
    const permanentTeeth = [1, 2, 3, 4, 5, 6, 7, 8];
    const deciduousTeeth = ["A", "B", "C", "D", "E"];

    const quadrentBorder: Record<string, string> = {
        "Upper Right": "border-r-2 border-b-2",
        "Upper Left": "border-b-2 border-l-2",
        "Lower Right": "border-t-2 border-r-2",
        "Lower Left": "border-l-2 border-t-2"
    };

    return (
        <div className="flex items-end w-full gap-3 mb-3">
            <Input
                onChange={handleFindingsName}
                value={findingsName ?? ''}
                placeholder="Gross Caries, BDR ..."
                className="rounded-md bg-[#F7F7F7] p-[9px] text-[13px]"
            />

            <Popover>
                <PopoverTrigger className="py-2 px-3 border rounded-md">Select Quadrant</PopoverTrigger>
                <PopoverContent className="w-96">
                    <div className="w-full">
                        {
                            quadrants.map(quad =>
                                <button
                                    key={quad}
                                    onClick={() => handleQuadrant(quad)}
                                    className={`w-1/2 h-12 hover:bg-[#0099FF] hover:text-white ${quadrentBorder[quad]} ${selectedQuadrant === quad && 'bg-[#0099FF] text-white'}`}
                                >
                                    {quad}
                                </button>
                            )
                        }
                    </div>

                    {selectedQuadrant !== null
                        &&
                        <div className="w-full">
                            <h2 className="text-center mt-3 font-medium">Select Tooth</h2>
                            <div className="flex justify-center gap-1 my-2">
                                {
                                    selectedQuadrant?.includes('Left') ?
                                        permanentTeeth.map(tooth =>
                                            <button
                                                key={`permanent_${tooth}`}
                                                onClick={() => handleSelectedTooth(tooth)}
                                                className={`border px-3 py-2 hover:bg-[#0099FF] hover:text-white ${selectedTeethMap[selectedQuadrant]?.includes(tooth) && 'bg-[#0099FF] text-white'}`}
                                            >
                                                {tooth}
                                            </button>
                                        )
                                        :
                                        permanentTeeth.reverse().map(tooth =>
                                            <button
                                                key={`permanent_${tooth}`}
                                                onClick={() => handleSelectedTooth(tooth)}
                                                className={`border px-3 py-2 hover:bg-[#0099FF] hover:text-white ${selectedTeethMap[selectedQuadrant]?.includes(tooth) && 'bg-[#0099FF] text-white'}`}
                                            >
                                                {tooth}
                                            </button>
                                        )
                                }
                            </div>
                            <div className="flex justify-center gap-1">
                                {
                                    selectedQuadrant?.includes('Left') ?
                                        deciduousTeeth.map(tooth =>
                                            <button
                                                key={`deciduous_${tooth}`}
                                                onClick={() => handleSelectedTooth(tooth)}
                                                className={`border px-3 py-2 hover:bg-[#0099FF] hover:text-white ${selectedTeethMap[selectedQuadrant]?.includes(tooth) && 'bg-[#0099FF] text-white'}`}
                                            >
                                                {tooth}
                                            </button>
                                        )
                                        :
                                        deciduousTeeth.reverse().map(tooth =>
                                            <button
                                                key={`deciduous_${tooth}`}
                                                onClick={() => handleSelectedTooth(tooth)}
                                                className={`border px-3 py-2 hover:bg-[#0099FF] hover:text-white ${selectedTeethMap[selectedQuadrant]?.includes(tooth) && 'bg-[#0099FF] text-white'}`}
                                            >
                                                {tooth}
                                            </button>
                                        )
                                }
                            </div>
                            <p className="text-center text-xs lg:text-sm mt-1.5">* Click again to unselect</p>
                        </div>
                    }
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default Findings;