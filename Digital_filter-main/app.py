
import numpy as np
import matplotlib.pyplot as plt
from flask import Flask,flash, render_template, request, redirect, url_for ,jsonify
import os
from werkzeug.utils import secure_filename
import json
from main_functions import filter
from Processing import processing

import pandas as pd
import os
import scipy 

process = processing()
filter_class = filter()

app = Flask(__name__)


def Convert_axis_to_complex(zero_coordinates):
    complexNumbers = [0]*len(zero_coordinates)
    for i in range(len(zero_coordinates)):
        x = round(zero_coordinates[i][0], 10)
        y = round(zero_coordinates[i][1], 10)
        complexNumbers[i] = x+ y*1j
    return complexNumbers


def convert_csv_tolist(df):
        zeros = []
        poles = []
        for i in range(len(df)):
            if complex(df['zeros'][i]) == 0 or complex(df['poles'][i]) == 0:
                continue
            zeros.append(complex(df['zeros'][i]))
            poles.append(complex(df['poles'][i]))
        return zeros,poles


def phaseResponse(a):
    freq, freq_res = scipy.signal.freqz([-a, 1.0], [1.0, -a])
    angels = np.zeros(512) if a==1 else np.unwrap(np.angle(freq_res))
    return freq/max(freq), np.around(angels, decimals=3)



def getAllPassFrequencyResponse(filterCoeffients):
        filter_angles = np.zeros(512)
        freq = np.zeros(512)
        for coeffient in filterCoeffients:
            freq, angles = phaseResponse(coeffient)
            filter_angles = np.add(filter_angles, angles)
        return freq, filter_angles

@app.route("/allpass" ,methods=['GET','POST'])
def allpass():
    if request.method == 'POST':
        coff = request.json['allpass']
        Frequency, filter_angles = getAllPassFrequencyResponse(coff)
        response = {'frequency': Frequency.tolist(),'phase': filter_angles.tolist(),}
        return json.dumps(response)
    else:
        return render_template('index.html')





@app.route("/applyallpass" ,methods=['GET','POST'])
def applyallpass():
    if request.method == 'POST': 
        a=request.json['a']
        Frequency, allPassAngles =getAllPassFrequencyResponse(a)
        Frequency , filterMagnitude ,filterAngels = process.get_Components()
        finalAngles = np.add(allPassAngles, filterAngels)
        finalMagnitude = filterMagnitude*1
        response = {'frequency': Frequency.tolist(),'phase': finalAngles.tolist(),'magnitude': finalMagnitude.tolist()}
        return json.dumps(response)
    else:
        return render_template('index.html')






@app.route('/unitcircle',methods=["GET","POST"])
def filter_function():
    if request.method == 'POST': 
        zeros = request.json['zeros']
        poles = request.json['poles']
        zeros_out = Convert_axis_to_complex(zeros)
        poles_out = Convert_axis_to_complex(poles)
        process.set_components(zeros_out, poles_out, 1)
        frequency, magnitude, phase = process.get_Components()
        response = {'frequency':frequency.tolist(),'magnitude':magnitude.tolist(),'phase':phase.tolist()}
        return json.dumps(response)
    else :
        return render_template('index.html')



@app.route("/importfilter" ,methods=['GET','POST'])
def importfilter():
    if request.method == 'POST': 
        value = request.files.get('imported-filter')
        data = pd.read_csv(value)
        zeros,poles =convert_csv_tolist(data)
        process.set_components(zeros,poles,1)
        frequency,magnitude,phase = process.get_Components()
        response = {'frequency':frequency.tolist(),'magnitude':magnitude.tolist(),'phase':phase.tolist()}
        return json.dumps(response)
    else:
        return render_template('index.html')




@app.route('/generte_signal',methods=["GET","POST"])
def generate_sig():
    if request.method == 'POST': 
        value = request.json['y_axis']
        value = np.array(value)
        value = process.apply_filter(value)
        print(value)
        return json.dumps(value.tolist())
    else :
        return render_template('index.html')




@app.route('/import_signal',methods=["GET","POST"])
def import_signal():
    if request.method == 'POST': 
        value = request.files.get('imported-signal')
        importedsig = pd.read_csv('./static/imported-signal/'+value.filename)
        new_signal = process.apply_filter(importedsig['y'])
        response = {'x':importedsig['x'].tolist(),'y':importedsig['y'].tolist(),'y_new':new_signal.tolist()}
        return json.dumps(response)
    else:
        return render_template('index.html')



@app.route('/exportFilter',methods=["GET","POST"])
def export_filter():
    if request.method == 'POST':
        zeros,poles = process.get_zeros_poles()
        exported_zeros = pd.DataFrame( {'zeros':zeros})
        exported_poles =  pd.DataFrame({'poles':poles})
        exported_data=pd.concat([exported_zeros, exported_poles], axis=1)
        exported_data = pd.DataFrame(exported_data)
        exported_data.to_csv('F:/Digital_filter-main/static/assests/Exported_filter.csv') 

    return 'exported'




@app.route('/',methods=["GET", "POST"])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug = True,port=5000)

