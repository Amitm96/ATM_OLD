<template>
  <q-page>
    <!-- <div class="row q-col-gutter-sm q-ma-xs q-mr-sm">
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card>
          <q-card-section class="bg-blue-8 text-white">
            <div class="row">
              <div class="col-10">
                <div class="text-h6">Sales</div>
                <div class="text-h5">160</div>
              </div>
              <div class="col-2">
                <q-icon size="62px" name="trending_up" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card>
          <q-card-section class="bg-green-8 text-white">
            <div class="row">
              <div class="col-10">
                <div class="text-h6">Goals</div>
                <div class="text-h5">140</div>
              </div>
              <div class="col-2">
                <q-icon size="62px" name="far fa-dot-circle" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card>
          <q-card-section class="bg-orange-9 text-white">
            <div class="row">
              <div class="col-10">
                <div class="text-h6">% Change</div>
                <div class="text-h5">
                  <q-icon name="arrow_downward" />2%
                </div>
              </div>
              <div class="col-2">
                <q-icon size="62px" name="compare_arrows" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div>
      <div class="row q-col-gutter-sm q-ma-xs q-mr-sm">
        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
          <q-card flat bordered class>
            <q-card-section class="row">
              <div class="text-h6 col-12">
                Sales vs Goals
                <q-btn
                  flat
                  dense
                  icon="fas fa-download"
                  class="float-right"
                  @click="SaveImage('bar')"
                  color="grey-8"
                >
                  <q-tooltip>Download</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>

            <q-separator inset></q-separator>

            <q-card-section>
              <IEcharts :option="barChartOption" ref="bar" :resizable="true" style="height:220px" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
          <q-card flat bordered class>
            <q-card-section class="row">
              <div class="text-h6 col-12">
                Market Share & Growth
                <q-btn
                  flat
                  dense
                  icon="fas fa-download"
                  class="float-right"
                  @click="SaveImage('line')"
                  color="grey-8"
                >
                  <q-tooltip>Download</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>

            <q-separator inset></q-separator>

            <q-card-section>
              <IEcharts
                ref="line"
                :option="lineChartOption"
                :resizable="true"
                style="height:220px"
              />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
          <q-card flat bordered class>
            <q-card-section class="row">
              <div class="text-h6 col-12">
                Sales vs Quota
                <q-btn
                  flat
                  dense
                  icon="fas fa-download"
                  class="float-right"
                  @click="SaveImage('gauge')"
                  color="grey-8"
                >
                  <q-tooltip>Download</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>

            <q-separator inset></q-separator>

            <q-card-section>
              <IEcharts :option="gaugeOptions" ref="gauge" :resizable="true" style="height:220px" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <div class="row q-col-gutter-sm q-ma-xs q-mr-sm">
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card flat bordered class>
          <q-card-section>
            <div class="text-h6">
              Key Competitors
              <q-btn
                flat
                dense
                icon="fas fa-download"
                class="float-right"
                @click="SaveImage('pie')"
                color="grey-8"
              >
                <q-tooltip>Download</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator inset></q-separator>

          <q-card-section>
            <IEcharts ref="pie" :option="pieOptions" :resizable="true" style="height:270px" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
        <q-card flat bordered class>
          <q-card-section>
            <div class="text-h6">
              Sales Pipeline by Sales Rep
              <q-btn
                flat
                dense
                icon="fas fa-download"
                class="float-right"
                @click="SaveImage('stack_bar')"
                color="grey-8"
              >
                <q-tooltip>Download</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator inset></q-separator>

          <q-card-section>
            <IEcharts
              ref="stack_bar"
              :option="stackedBarOptions"
              :resizable="true"
              style="height:270px"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>-->
    <div class="row q-col-gutter-sm q-ma-xs">
      <div class="col-12">
        <q-card flat bordered class="bg-white">
          <q-table
            title="All Activities"
            :data="trips"
            :hide-header="mode === 'grid'"
            :columns="columns"
            row-key="name"
            :grid="mode=='grid'"
            :filter="filter"
            :pagination.sync="pagination"
          >
            <template v-slot:top-right="props">
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>

              <q-btn
                flat
                round
                dense
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen"
                v-if="mode === 'list'"
              >
                <q-tooltip
                  :disable="$q.platform.is.mobile"
                  v-close-popup
                >{{props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}}</q-tooltip>
              </q-btn>
              <q-input
                ref="date"
                filled
                v-model="dateRange"
                label="Choose Dates"
                lazy-rules
                :rules="[ val => val !== null && val !== '' || 'Please select a date']"
                @click="$refs.qDateProxy.show()">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy">
                      <q-card class="my-card">

                      <q-card-section horizontal>
                          <q-card-section>
                            <q-date v-model="fromDate" mask="DD-MM-YYYY" />
                          </q-card-section>
                          <q-separator vertical />
                          <q-card-section>
                            <q-date v-model="toDate" mask="DD-MM-YYYY" />
                          </q-card-section>
                        </q-card-section>
                        <q-separator />
                        <q-card-actions vertical>
                          <q-btn color="primary" label="Apply"
                            @click="$refs.qDateProxy.hide(),applydate()"
                          />
                        </q-card-actions>
                      </q-card>
                    </q-popup-proxy>
                </q-icon>
                </template>
              </q-input>

              <q-btn
                flat
                round
                dense
                :icon="mode === 'grid' ? 'list' : 'grid_on'"
                @click="mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal'"
                v-if="!props.inFullscreen"
              >
                <q-tooltip
                  :disable="$q.platform.is.mobile"
                  v-close-popup
                >{{mode==='grid' ? 'List' : 'Grid'}}</q-tooltip>
              </q-btn>

              <q-btn
                color="primary"
                icon-right="archive"
                label="Export to csv"
                no-caps
                @click="exportTable"
              />
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import Vue from 'vue'
import IEcharts from 'vue-echarts-v3/src/full.js'
import { exportFile } from 'quasar'
import gql from 'graphql-tag'
import moment from 'moment'
import { mapState } from 'vuex'

Vue.component('IEcharts', IEcharts)

function wrapCsvValue (val, formatFn) {
  let formatted = formatFn !== void 0 ? formatFn(val) : val

  formatted =
    formatted === void 0 || formatted === null ? '' : String(formatted)

  formatted = formatted.split('"').join('""')

  return `"${formatted}"`
}

export const GET_MY_TODOS = gql`
  query tripReportQuery(
    $to_date:timestamptz!,
    $from_date:timestamptz!,
    $compay_id: uuid!
  ) {
    trips(
    where: { _and : [
      {tp_date: {_gte: $from_date}},
      {tp_date: {_lte: $to_date}},
      {permit: {company_id: {_eq: $compay_id}}}
    ]}
    ) {
      truck {
      truck_number
      owner{
        name
        gstn_pan
        phone_number
      }
    }
    permit {
      permit_number
      owner_rate_per_tonne
      owner_shortage_per_tonne
    }
    tp_number
    tp_date
    truck_number
    load_carrying
    unloaded_quantity
    advance
    fuel
    extra
  }
 }`

export default {
  data () {
    return {
      fromDate: moment().startOf('month').format('DD-MM-YYYY'),
      toDate: moment().format('DD-MM-YYYY'),
      barChartOption: {
        grid: {
          bottom: '20%',
          left: '15%',
          top: '3%'
        },
        legend: {
          bottom: 0
        },
        tooltip: {},
        dataset: {
          dimensions: ['time_period', 'sale', 'goal'],
          source: [
            { time_period: 'Jan 2019', sale: 50, goal: 70 },
            { time_period: 'Feb 2019', sale: 80, goal: 75 },
            { time_period: 'Mar 2019', sale: 86, goal: 80 },
            { time_period: 'Apr 2019', sale: 72, goal: 85 }
          ]
        },
        xAxis: {
          type: 'category'
          // axisLabel: {
          //     rotate: 45
          // }
        },
        yAxis: {
          // name: 'Goal',
          // nameLocation: 'center',
          // nameGap: 30,
          // nameTextStyle:{
          //     fontWeight: 'bold'
          // }
        },
        series: [
          { type: 'bar', name: 'Sales' },
          { type: 'bar', name: 'Goals' }
        ]
      },
      lineChartOption: {
        grid: {
          bottom: '20%',
          left: '15%',
          top: '3%'
        },
        legend: {
          bottom: 0
        },
        tooltip: {
          // formatter:
          //     function (param) {
          //     console.log(param)
          //     // return param.seriesName + '<br />' + param.name + ': ';
          // }
        },
        dataset: {
          dimensions: ['product_name', 'share', 'growth'],
          source: [
            { product_name: 'Product A', share: 20, growth: 25 },
            { product_name: 'Product B', share: 22, growth: 18 },
            { product_name: 'Product C', share: 40, growth: 45 }
          ]
        },
        xAxis: {
          type: 'category'
          // axisLabel: {
          //     rotate: 45
          // }
        },
        yAxis: {
          axisLabel: {
            formatter: function (value, index) {
              return value + ' %'
            }
          }
        },
        series: [
          { type: 'line', name: 'Share' },
          { type: 'line', name: 'Growth' }
        ]
      },
      pieOptions: {
        tooltip: {
          show: true
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          width: 300
        },
        series: [
          {
            name: 'Competitor',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: true,
                position: 'inner',
                formatter: function (param, index) {
                  return param.value + ' %'
                }
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '20',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            selectedMode: 'single',
            data: [
              { value: 40, name: 'Product 1', selected: true },
              { value: 20, name: 'Competitor 1', selected: false },
              { value: 15, name: 'Competitor 2', selected: false },
              { value: 25, name: 'Competitor 3', selected: false }
            ]
          }
        ]
      },
      gaugeOptions: {
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
          {
            type: 'gauge',
            detail: { formatter: '{value}%' },
            data: [{ value: 30 }],
            min: 0,
            radius: '100%',
            axisLine: {
              show: true,
              lineStyle: {
                color: [
                  [0.35, '#293c55'],
                  [0.65, '#61a0a8'],
                  [1, '#c23731']
                ],
                width: 20
              }
            }
          }
        ]
      },
      stackedBarOptions: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(50,50,50,0.9)'
        },
        legend: {
          bottom: 0
        },
        color: ['#3395dd', '#ed892d', '#34393b'],
        // legend: {
        //     y: "bottom",
        //     data: [{name: 'Territory Sales', icon: 'circle'}, {
        //         name: 'Remaining Nation Sales',
        //         icon: 'circle'
        //     }]
        // },
        grid: {
          bottom: '10%',
          left: '15%',
          top: '9%'
        },
        calculable: true,
        xAxis: {
          type: 'value',
          position: 'top',
          axisLine: {
            show: false
          },
          axisLabel: {
            formatter: function (value, index) {
              return '$' + value
            }
          }
        },
        yAxis: [
          {
            type: 'category',
            data: [
              'Alex Morrow',
              'Joanna Carter',
              'Jimmy Joanna',
              'Mack Hales'
            ],
            axisLabel: {
              fontSize: 12
            }
          }
        ],
        series: [
          {
            name: 'Qualification',
            type: 'bar',
            stack: 'A',
            data: [300, 350, 400, 500]
          },
          {
            name: 'Discovery',
            type: 'bar',
            stack: 'A',
            data: [100, 180, 250, 300]
          },
          {
            name: 'Quote',
            type: 'bar',
            stack: 'A',
            data: [100, 120, 200, 220]
          }
        ]
      },
      filter: '',
      mode: 'list',
      columns: [
        {
          name: 'owner_name',
          align: 'left',
          label: 'Owner Name',
          field: row => ownerName(row),
          sortable: true
        },
        {
          name: 'owner_pan',
          align: 'left',
          label: 'PAN Number',
          field: row => panNumber(row),
          sortable: false
        },
        {
          name: 'owner_phone',
          align: 'left',
          label: 'Phone Number',
          field: row => phoneNumber(row),
          sortable: false
        },
        {
          name: 'tp_number',
          align: 'left',
          label: 'TP Number',
          field: row => row.tp_number,
          sortable: false
        },
        {
          name: 'tp_date',
          align: 'left',
          label: 'Date',
          field: row => dateString(row),
          sortable: true
        },
        {
          name: 'truck_number',
          required: true,
          label: 'Truck Number',
          align: 'left',
          field: row => row.truck.truck_number,
          sortable: false
        },
        {
          name: 'load_carrying',
          required: true,
          label: 'L TON',
          align: 'left',
          field: row => row.load_carrying,
          sortable: false
        },
        {
          name: 'unloaded_quantity',
          required: false,
          label: 'UNL TON',
          align: 'left',
          field: row => row.unloaded_quantity || '0',
          sortable: false
        },
        {
          name: 'rate',
          required: false,
          label: 'RATE',
          align: 'left',
          field: row => row.permit.owner_rate_per_tonne,
          sortable: false
        },
        {
          name: 'amount',
          required: false,
          label: 'Gross Amount',
          align: 'left',
          field: row => grossAmount(row),
          sortable: false
        },
        {
          name: 'advance',
          required: false,
          label: 'Advance',
          align: 'left',
          field: row => advance(row),
          sortable: false
        },
        {
          name: 'fuel',
          required: false,
          label: 'Fuel',
          align: 'left',
          field: row => fuel(row),
          sortable: false
        },
        {
          name: 'shortage',
          required: false,
          label: 'Shortage',
          align: 'left',
          field: row => shortage(row),
          sortable: false
        },
        {
          name: 'shortage_amount',
          required: false,
          label: 'SRT AMT',
          align: 'left',
          field: row => shortageAmount(row),
          sortable: false
        },
        {
          name: 'net_amount',
          required: false,
          label: 'NET AMT',
          align: 'left',
          field: row => netAmount(row),
          sortable: false
        }
      ],
      trips: [ ],
      pagination: {
        rowsPerPage: 10
      }
    }
  },

  apollo: {
    trips: {
      query: GET_MY_TODOS,
      variables () {
        return {
          to_date: moment(this.toDate, 'DD-MM-YYYY'),
          from_date: moment(this.fromDate, 'DD-MM-YYYY'),
          compay_id: this.userDetails.company.id
        }
      }

    }
  },

  computed: {
    ...mapState('store', ['userDetails']),
    dateRange: function () {
      return `${this.fromDate} to ${this.toDate}`
    }
  },

  methods: {
    async applydate () {
      console.log(`testing hide`, this.fromDate, this.toDate)
      await this.$apollo.queries.trips.refetch()
    },

    SaveImage (type) {
      const linkSource = this.$refs[type].getDataURL()
      const downloadLink = document.createElement('a')
      document.body.appendChild(downloadLink)
      downloadLink.href = linkSource
      downloadLink.target = '_self'
      downloadLink.download = type + '.png'
      downloadLink.click()
    },
    exportTable () {
      // naive encoding to csv format
      const content = [this.columns.map(col => wrapCsvValue(col.label))]
        .concat(
          this.trips.map(row =>
            this.columns
              .map(col =>
                wrapCsvValue(
                  typeof col.field === 'function'
                    ? col.field(row)
                    : row[col.field === void 0 ? col.name : col.field],
                  col.format
                )
              )
              .join(',')
          )
        )
        .join('\r\n')

      const status = exportFile('trips-details.csv', content, 'text/csv')

      if (status !== true) {
        this.$q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    }
  }
}

function ownerName (r) {
  return (r.truck && r.truck.owner && r.truck.owner.name) || ''
}

function panNumber (r) {
  return (r.truck && r.truck.owner && r.truck.owner.gstn_pan) || ''
}

function phoneNumber (r) {
  return (r.truck && r.truck.owner && r.truck.owner.phone_number) || ''
}

function grossAmount (r) {
  return (r.unloaded_quantity || 0) * ((r.permit && r.permit.owner_rate_per_tonne) || 0)
}

function advance (r) {
  try {
    let sum = 0
    r.extra.payment_details.advance.forEach(adv => {
      sum += adv.amount
    })
    return sum
  } catch (e) {
    return 0
  }
}

function fuel (r) {
  try {
    let sum = 0
    r.extra.payment_details.fuel.forEach(fl => {
      sum += fl.total
    })
    return sum
  } catch (e) {
    return 0
  }
}

function netAmount (r) {
  return grossAmount(r) - fuel(r) - advance(r) - shortageAmount(r)
}

function shortage (r) {
  return ((r.permit && r.permit.owner_shortage_per_tonne) || 0)
}

function shortageAmount (r) {
  try {
    let unloadedQuantity = r.unloaded_quantity || 0
    let loadQuantity = r.load_carrying || 0
    let diff = loadQuantity - unloadedQuantity
    if (diff > loadQuantity * (0.5 / 100)) {
      return diff * ((r.permit && r.permit.owner_shortage_per_tonne) || 0)
    } else {
      return 0
    }
  } catch (e) {
    return 0
  }
}

function dateString (r) {
  try {
    return new Date(r.tp_date).toLocaleDateString()
  } catch (r) {
    return ''
  }
}
</script>

<style scoped>
</style>
