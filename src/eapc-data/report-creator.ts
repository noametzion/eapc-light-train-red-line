const get_max = (data_array: number[]) => {
    let max = data_array[0];
    data_array.forEach(d => {
        if(d > max) {
            max = d;
        }
    })
    return max;
};
const get_min = (data_array: number[]) => {
    let min = data_array[0];
    data_array.forEach(d => {
        if(d < min) {
            min = d;
        }
    })
    return min;
};
const get_avg = (data_array: number[]) => {
    let sum = 0;
    let count = 0;
    data_array.forEach((d) => {
        if (d !== undefined) {
            sum += d;
            count++;
        }
    })
    return sum/count;
}
const get_time_diff = (date_from: Date, date_to: Date) => (date_to.getTime() - date_from.getTime()) / 1000 / 60;
const check_outside_limits = (value: number, max_limit?: number, min_limit?: number) => {
    const is_above_max_limit = max_limit !== undefined && value > max_limit;
    const is_below_min_limit = min_limit !== undefined && value < min_limit;
    return is_above_max_limit || is_below_min_limit;
}
// All 3 functions returns the time in minutes
const get_total_time_outside_limit = (date_value_pairs: { date: Date; value: number; }[], max_limit?: number, min_limit?: number) => {
    let total_minutes = 0;
    date_value_pairs.forEach((dv_pair, dv_pair_index) => {
        if(dv_pair_index > 0 && check_outside_limits(dv_pair.value, max_limit, min_limit)) {
            total_minutes += get_time_diff(date_value_pairs[dv_pair_index -1].date, dv_pair.date);
        }
    })
    return total_minutes;
}
function get_time_above_limit(date_value_pairs: { date: Date; value: number; }[], max_limit: number) {
    return get_total_time_outside_limit(date_value_pairs, max_limit);
}
function get_time_below_limit(date_value_pairs: { date: Date; value: number; }[], min_limit: number) {
    return get_total_time_outside_limit(date_value_pairs, undefined, min_limit);
}

const create_report = (data_logs: data_log[],  data_info: DataInfo) => {

    const thickness_at_start = data_logs[0].thickness;
    const thickness_at_end = data_logs[data_logs.length-1].thickness;
    const thickness_difference = thickness_at_start - thickness_at_end;

    // MIN, MAX, AVG time above 15 - V
    const vac_data_array = data_logs.map((dl) => dl.vac);
    const vac_max = get_max(vac_data_array);
    const vac_min = get_min(vac_data_array);
    const vac_avg = get_avg(vac_data_array);
    const vac_time_above_limit = get_time_above_limit(
        data_logs.map((dl) => ({date: dl.date, value: dl.vac})), 
        15
    );

    // MIN, MAX, AVG, time above 20 - V
    const ac_data_array = data_logs.map((dl) => dl.ac);
    const ac_max = get_max(ac_data_array);
    const ac_min = get_min(ac_data_array);
    const ac_avg = get_avg(ac_data_array);
    const ac_time_above_limit = get_time_above_limit(
        data_logs.map((dl) => ({date: dl.date, value: dl.ac})), 
        20
    );

    // MIN, MAX, AVG, time above 0.03
    const dc_data_array = data_logs.map((dl) => dl.dc);
    const dc_max = get_max(dc_data_array);
    const dc_min = get_min(dc_data_array);
    const dc_avg = get_avg(dc_data_array);
    const dc_time_above_limit = get_time_above_limit(
        data_logs.map((dl) => ({date: dl.date, value: dl.dc})), 
        0.03
    );

    // MIN, MAX, AVG, time above -1.5, Eoff - Eonn (last Eoff) ->MIN, MAX, total time under 0 
    const eon_data_array = data_logs.map((dl) => dl.eon);
    const eon_max = get_max(eon_data_array);
    const eon_min = get_min(eon_data_array);
    const eon_avg = get_avg(eon_data_array);
    const eon_time_above_limit = get_time_above_limit(
        data_logs.map((dl) => ({date: dl.date, value: dl.eon})), 
        -1.15
    );
    // Here should NOT consider the old data because the one that measure every second dont always have the off value -> i fixed the data before
    const eon_eoff_diff_array = data_logs.map((dl) => dl.eoff - dl.eon);
    const eon_eoff_diff_max = get_max(eon_eoff_diff_array);
    const eon_eoff_diff_min = get_min(eon_eoff_diff_array);
    // Here should NOT consider the old data because the one that measure every second dont always have the off value -> i fixed the data before
    const eon_eoff_diff_time_below_limit = get_time_below_limit(
        data_logs.map((dl) => ({date: dl.date, value: dl.eoff - dl.eon})), 
        0
    );

    // MIN, MAX, AVG, Number above -0.850
    const eoff_data_array = data_logs.map((dl) => dl.eoff);
    const eoff_max = get_max(eoff_data_array);
    const eoff_min = get_min(eoff_data_array);
    const eoff_avg = get_avg(eoff_data_array);
    // Here should NOT consider the old data because the one that measure every second dont always have the off value -> i fixed the data before
    const eoff_time_above_limit = get_time_above_limit(
        data_logs.map((dl) => ({date: dl.date, value: dl.eoff})), 
        -0.85
    );

    // TODO: add units for each value'
    // TODO: math.round
    
    return ({
        info: data_info,
        thickness: {
            thickness_at_start,
            thickness_at_end,
            thickness_difference,
        },
        ac_dc: {
            vac_max,
            vac_min,
            vac_avg,
            vac_time_above_limit,
            ac_max,
            ac_min,
            ac_avg,
            ac_time_above_limit,
            dc_max,
            dc_min,
            dc_avg,
            dc_time_above_limit
        },
        eon_eoff: {
            eon_max,
            eon_min,
            eon_avg,
            eon_time_above_limit,
            eon_eoff_diff_max,
            eon_eoff_diff_min,
            eon_eoff_diff_time_below_limit,
            eoff_max,
            eoff_min,
            eoff_avg,
            eoff_time_above_limit,
        }
    });
}

export {create_report};